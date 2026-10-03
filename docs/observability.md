---
title: Counters and experiment validation
description: "Interpret FEMU vendor counters, interval deltas, write amplification, and host measurements to verify that an experiment exercises its intended path."
---

# Counters and experiment validation

Record both host-observed behavior and device-model counters. Throughput alone
cannot show whether a mapping, buffer, or collection policy was exercised.
Commands below run inside a Linux guest against the intended FEMU controller.

## Identity and standard health

```bash
sudo nvme list
sudo nvme id-ctrl /dev/nvme0
sudo nvme id-ns /dev/nvme0n1
sudo nvme smart-log /dev/nvme0
```

Confirm capacity, namespace format, advertised command capabilities, and the
correct mode before starting a workload. Standard SMART reports health and
media-error information. FEMU's detailed page counters are in vendor log
**0xc0**, not an arbitrary reserved field of the standard SMART page.

## Read the vendor counters

```bash
sudo nvme get-log /dev/nvme0 --log-id=0xc0 --log-len=512 -b > femu-stats.bin &&
python3 decode-femu-stats.py femu-stats.bin
```

The decoder runs only if the log command succeeds. If that command fails,
preserve its diagnostic output and inspect the controller and revision before
retrying; a partially written file is not a successful snapshot.

[Download the decoder](/tools/decode-femu-stats.py). It reads the
`FemuStatsLog` layout and checks the log length. The fields are little-endian;
the manual's [log pages and counters](/manual/reference/log-pages-and-counters)
reference is the authoritative layout and also covers the Telemetry
Host-Initiated capture of the same block and the Supported Log Pages list:

| Offset (bytes) | Field | Interpretation |
| --- | --- | --- |
| 0 | `waf_x1000`, uint32 | WAF scaled by 1000; zero in this log if no host pages were written |
| 8 | `host_write_pages`, uint64 | Host-requested write pages |
| 16 | `gc_write_pages`, uint64 | Relocation programs, including implemented merge traffic |
| 24 | `nand_write_pages`, uint64 | Non-GC NAND programs |
| 32 | `max_block_reads`, uint64 | Most-read block's count since erase |
| 40 | `read_reclaims`, uint64 | Lines refreshed because of read stress |
| 48 | `retention_refreshes`, uint64 | Lines refreshed because of age |
| 56, 64 | `buffer_reads`, `buffer_read_hits` | Read pages observed and answered by the write buffer |
| 72, 80 | `buffer_writes`, `buffer_write_hits` | Write pages observed and coalesced in the write buffer |
| 88 | `hybrid_switch_merges`, uint64 | Log-block switch merges; `mapping=hybrid` only |
| 96 | `hybrid_full_merges`, uint64 | Log-block full merges; `mapping=hybrid` only |
| 104 | `hybrid_merge_erases`, uint64 | Block erases charged to log-block merges; `mapping=hybrid` only |

All fields after offset 8 in this table are uint64; bytes 4 to 7 and 112 to 511
are reserved. The log sums the counters of the controller's black-box, CSD and
KV namespaces, except `max_block_reads`, which is the largest of them. Other
modes leave the fields zero. The three merge counters exclude physical line GC,
and other mappings, including `fast`, leave them zero. Use one namespace for
straightforward policy comparisons. The buffer hit fields describe the **write buffer**, not
the separate `read_cache_mb` cache. Read-cache and CMT hit/miss counters exist
internally but are not fields in this vendor-log layout.

For a measured interval, take before/after snapshots and compute:

```text
interval WAF = (delta nand_write_pages + delta gc_write_pages)
               / delta host_write_pages
```

The decoder can compute these deltas directly:

```bash
python3 decode-femu-stats.py after.bin --before before.bin
```

Its `interval` object contains counter deltas and interval WAF, with `null` WAF
when no host pages were written. Use snapshots from the same running controller.
The decoder rejects decreasing cumulative counters but cannot detect every
restart or device mix-up. `max_block_reads` is a gauge that can decrease after
erase, so it is excluded from the interval deltas.

The lifetime `waf` value comes from the device's integer `waf_x1000` field.
For example, eight programmed pages divided by three host pages is encoded as
2666, which the decoder displays as 2.666. Interval WAF is calculated from the
raw counter differences and can retain more fractional digits. Compare ratios
over the same interval; subtracting two lifetime WAF values does not produce
an interval WAF.

An enabled write buffer may retain pages at the end of a workload. Include a
Flush when measuring final programming cost, or explicitly report the remaining
buffering boundary. WAF can be below one when multiple host writes coalesce
into one program. A zero host-write delta makes interval WAF undefined.

## Page counts are not application bytes

In the ordinary black-box write path, `host_write_pages` counts the logical
NAND pages overlapped by each request, including repeated touches. It is not
a count of unique pages or a byte counter. With 4 KiB pages and 512-byte LBAs:

| Request | Pages counted |
| --- | --- |
| One aligned 4 KiB write | 1 |
| Eight separate 512-byte writes within that same page | 8 in total |
| One 4 KiB write starting 512 bytes into a page | 2 |

Multiplying these counts by 4 KiB would overstate transferred bytes in the
last two cases. The page-based WAF above is therefore distinct from NAND
bytes divided by application bytes. Filesystem, application, and guest-cache
behavior also affect which device requests reach this counter.

`ssd_write()` increments the counter before attempting all page programs or
buffer admissions. A request that later fails can already contribute to it;
the counter alone does not establish successful completion. Check command
status and workload errors alongside the deltas. The range calculation uses
the namespace LBA size and backend offset in `ssd_lpn_range()`, rather than
assuming every formatted namespace has 512-byte LBAs.

## Design a comparison that reaches the feature

| Feature | Exercise | Evidence |
| --- | --- | --- |
| Line GC | Precondition and continue overwriting until collection occurs | GC diagnostics; relocation-page deltas show copying, but a fully invalid victim needs no copies |
| Hybrid/FAST merges | Sequential full-block runs versus interleaved random updates | Hybrid: switch-merge, full-merge and merge-erase deltas. FAST: relocation counts and merge debug traces |
| Read cache | Repeat a bounded working set, then exceed its size | Read-latency change; instrument internal cache counters for direct hit rate |
| Write buffer | Repeated LPN updates, then Flush; separately use FUA | Buffer-hit and NAND-program deltas; Flush latency |
| Read refresh | Accumulate reads, then issue a write with spare space available | `read_reclaims` delta |
| Retention refresh | Wait beyond the configured age, read, then write | `retention_refreshes` delta |
| Error insertion | Reach the configured operation period | Failed command status and standard media-error counters |
| ZNS | Open/write/append/finish/reset and report zones | Write pointers, zone states, resource errors |
| FDP | Write distinct placement streams and inspect placement logs | Per-handle use and reclaim behavior |

## Select the right diagnostic control

| Control | When selected | What it enables |
| --- | --- | --- |
| `debug_ftl=on` | Device configuration | Selected black-box consistency diagnostics and mapping-merge logs at guarded call sites |
| `FEMU_DEBUG_NVME` | Compile-time definition | `femu_debug` output; some I/O call sites additionally require runtime `print_log` |
| `FEMU_DEBUG_FTL` | Compile-time definition | `ftl_debug` output and the `ftl_assert` macro |
| `FEMU_FTL_ASSERT` | Compile-time definition | The `ftl_assert` macro without enabling `ftl_debug` chatter |
| `FEMU_FDP_DEBUG` | Host environment before launch | Conditional `FDP_TRACE` output for initialized black-box FTL state |

The black-box vendor logging toggle changes `print_log`; it cannot restore
`femu_debug` calls compiled out of the binary. `ftl_log` itself is unconditional,
although a caller may guard it with `debug_ftl` or another condition. Missing
log output therefore does not by itself show that a policy failed to run.

The FDP environment check tests whether the variable exists. Setting
`FEMU_FDP_DEBUG=0` still enables those traces; unset it to disable them. Record
compiler definitions, device properties, and host environment with a debug
run. Logging, assertions, and debugger pauses change host execution cost, so
collect performance results separately from instrumented debugging sessions.

## Reproducibility record

Save the commit, expanded device arguments, guest kernel and tools, host CPU
and memory placement, queue depth, workload seed, warm-up, preconditioning,
measurement interval, and before/after counters. Separate tests of protocol
correctness from comparisons of modeled timing. Repeat runs when host scheduling
variation is material; no-SSD and a mode with flash timing answer different
questions.

## Implementation sources

Reviewed against FEMU [`39a55eeb6`](https://github.com/MoatLab/FEMU/tree/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be). The examples describe this revision; see [validation coverage](/docs/implementation#validation-coverage).

- [nvme.h](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/nvme.h): FemuStatsLog wire layout
- [nvme-admin.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/nvme-admin.c): nvme_collect_media_stats and log 0xc0
- [bbssd/ftl.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl.c): counter accessors and periodic errors
- [bbssd/ftl.h](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl.h): FTL logging and assertion macros
- [bbssd/bb.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/bb.c): runtime logging toggle
- [bbssd/ftl-datapath.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl-datapath.c): refresh triggers and buffering
