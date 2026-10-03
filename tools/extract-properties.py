#!/usr/bin/env python3
"""Extract FEMU's device properties from the source into structured data.

FEMU exposes its configuration as QOM properties declared in one table per
object. There are well over a hundred, they change with every feature, and the
README documents only some of them, so a hand-written reference on the website
would be wrong within a release. Read them from the source instead.

Usage: extract-properties.py <path-to-femu-checkout> [-o out.json]

Emits JSON: one record per property with its name, the object it belongs to,
its C type, its default, the source line it came from, and the trailing comment
when the declaration carries one.
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys

# DEFINE_PROP_<KIND>("name", Struct, field[, default][, extra]) spanning lines
PROP_RE = re.compile(
    r'DEFINE_PROP_(?P<kind>[A-Z0-9_]+)\s*\(\s*'
    r'"(?P<name>[^"]+)"\s*,\s*'
    r'(?P<struct>\w+)\s*,\s*'
    r'(?P<rest>.*?)\)\s*,',
    re.S)

C_TYPE = {
    'UINT8': 'uint8', 'UINT16': 'uint16', 'UINT32': 'uint32',
    'UINT64': 'uint64', 'INT32': 'int32', 'INT64': 'int64',
    'SIZE': 'size', 'STRING': 'string', 'BOOL': 'bool', 'LINK': 'link',
}

# which object a property is set on, which decides where it goes on a command line
OBJECT_ROLE = {
    'FemuCtrl': 'device',
    'NvmeSubsystem': 'subsystem',
}


def split_args(rest):
    """Split the remaining macro arguments on top-level commas."""
    args, depth, cur = [], 0, ''
    for ch in rest:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            args.append(cur.strip())
            cur = ''
        else:
            cur += ch
    if cur.strip():
        args.append(cur.strip())
    return args


def extract(source):
    text = source.read_text(errors='replace')
    lines = text.splitlines()
    out = []
    for m in PROP_RE.finditer(text):
        line_no = text[:m.start()].count('\n') + 1
        args = split_args(m.group('rest'))
        field = args[0] if args else ''
        default = args[1] if len(args) > 1 else None
        kind = m.group('kind')
        if kind in ('STRING', 'LINK'):
            default = None

        # a comment on the last line of the declaration usually explains the unit
        end_line = text[:m.end()].count('\n')
        comment = None
        for probe in range(line_no - 1, min(end_line + 1, len(lines))):
            hit = re.search(r'/\*\s*(.*?)\s*\*/', lines[probe])
            if hit:
                comment = hit.group(1)
                break

        out.append({
            'name': m.group('name'),
            'object': m.group('struct'),
            'role': OBJECT_ROLE.get(m.group('struct'), 'other'),
            'type': C_TYPE.get(kind, kind.lower()),
            'field': field,
            'default': default,
            'note': comment,
            'source': f'{source.name}:{line_no}',
        })
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('checkout', type=pathlib.Path)
    ap.add_argument('-o', '--out', type=pathlib.Path)
    args = ap.parse_args()

    femu_c = args.checkout / 'hw' / 'femu' / 'femu.c'
    if not femu_c.is_file():
        sys.exit(f'not a FEMU checkout: {femu_c} is missing')

    props = extract(femu_c)
    props.sort(key=lambda p: (p['role'], p['name']))

    commit = subprocess.check_output(
        ['git', '-C', str(args.checkout), 'rev-parse', 'HEAD'], text=True
    ).strip()
    payload = {
        'source_commit': commit,
        'count': len(props),
        'properties': props,
    }
    text = json.dumps(payload, indent=2) + '\n'
    if args.out:
        args.out.write_text(text)
        print(f'{len(props)} properties -> {args.out}', file=sys.stderr)
    else:
        sys.stdout.write(text)


if __name__ == '__main__':
    main()
