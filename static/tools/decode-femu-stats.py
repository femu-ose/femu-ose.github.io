#!/usr/bin/env python3
"""Decode the 512-byte FEMU vendor log 0xc0 (FemuStatsLog) at revision 39a55eeb6.

Offsets 88, 96 and 104 hold the hybrid-mapping merge counters; earlier
revisions leave those bytes reserved and zero, so they decode as zero there.
"""
import argparse
import json
from pathlib import Path
import struct

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('log', type=Path)
parser.add_argument('--before', type=Path,
                    help='Earlier snapshot from the same running controller')
args = parser.parse_args()
names = ['host_write_pages', 'gc_write_pages', 'nand_write_pages',
         'max_block_reads', 'read_reclaims', 'retention_refreshes',
         'buffer_reads', 'buffer_read_hits', 'buffer_writes', 'buffer_write_hits',
         'hybrid_switch_merges', 'hybrid_full_merges', 'hybrid_merge_erases']


def decode(path):
    try:
        data = path.read_bytes()
    except OSError as error:
        parser.error(str(error))
    if len(data) != 512:
        parser.error(f'{path}: expected 512 bytes, received {len(data)}')
    result = dict(zip(names, struct.unpack_from(f'<{len(names)}Q', data, 8)))
    result['waf_x1000'] = struct.unpack_from('<I', data)[0]
    result['waf'] = result['waf_x1000'] / 1000 if result['host_write_pages'] else None
    return result


result = decode(args.log)
if args.before:
    before = decode(args.before)
    # max_block_reads is a gauge that can decrease after an erase.
    deltas = {name: result[name] - before[name]
              for name in names if name != 'max_block_reads'}
    if any(value < 0 for value in deltas.values()):
        parser.error('counter decreased: snapshots may be reversed or from different runs')
    host_pages = deltas['host_write_pages']
    deltas['waf'] = ((deltas['nand_write_pages'] + deltas['gc_write_pages']) /
                     host_pages) if host_pages else None
    result['interval'] = deltas
print(json.dumps(result, indent=2))
