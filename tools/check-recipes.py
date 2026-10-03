#!/usr/bin/env python3
"""Check downloadable recipes against a FEMU checkout and expand its INI helper.

This checks property ownership and helper expansion, not device realization.
Use --bash to select Bash 4+ on systems whose default Bash is older.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import shlex
import subprocess
import tempfile
from urllib.request import urlopen

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('checkout', type=Path)
parser.add_argument('--bash', default='bash')
parser.add_argument('--site-url', help='Also verify served downloads, e.g. http://localhost:3001/femu/')
parser.add_argument('--report', type=Path, help='Save expansion evidence as JSON')
args = parser.parse_args()
args.checkout = args.checkout.resolve()
website = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    'extract_properties', Path(__file__).with_name('extract-properties.py'))
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)
props = extractor.extract(args.checkout / 'hw/femu/femu.c')
roles = {p['name']: p['role'] for p in props}
helper = args.checkout / 'hw/femu/scripts/ssd-config.sh'
count = 0
records = []


def device_properties(argument):
    """Decode QEMU's doubled commas before comparing the emitted properties."""
    fields, field, index = [], '', 0
    while index < len(argument):
        if argument[index:index + 2] == ',,':
            field += ','
            index += 2
        elif argument[index] == ',':
            fields.append(field)
            field = ''
            index += 1
        else:
            field += argument[index]
            index += 1
    fields.append(field)
    properties = {}
    for entry in fields[1:]:
        key, value = entry.split('=', 1)
        if key in properties:
            raise ValueError(f'duplicate emitted property: {key}')
        properties[key] = value
    return fields[0], properties


for config in sorted((website / 'static/configs').glob('*.conf')):
    role = 'device'
    seen = set()
    expected = {'device': {}, 'subsystem': {}}
    for lineno, line in enumerate(config.read_text().splitlines(), 1):
        line = line.split('#', 1)[0].split(';', 1)[0].strip()
        if not line:
            continue
        if line.startswith('['):
            role = 'subsystem' if line in ('[subsys]', '[subsystem]') else 'device'
            continue
        key, value = (part.strip() for part in line.split('=', 1))
        if (role, key) in seen:
            raise SystemExit(f'{config.name}:{lineno}: duplicate {key}')
        seen.add((role, key))
        expected[role][key] = value
        if key == 'mode' and role == 'device':
            if value not in ('bbssd', 'znssd', 'nossd', 'ocssd', 'csd', 'kvssd'):
                raise SystemExit(f'{config.name}:{lineno}: unknown mode {value}')
        elif roles.get(key) != role:
            raise SystemExit(f'{config.name}:{lineno}: {key} is not a {role} property')
    data = config.read_bytes()
    if args.site_url:
        with urlopen(args.site_url.rstrip('/') + '/configs/' + config.name, timeout=15) as response:
            served = response.read()
        if served != data:
            raise SystemExit(f'{config.name}: served download differs from source')
        data = served
    with tempfile.TemporaryDirectory(prefix='femu-recipe-') as directory:
        local = Path(directory) / config.name
        local.write_bytes(data)
        result = subprocess.run([args.bash, str(helper), config.name], cwd=directory,
                                capture_output=True, text=True)
    if result.returncode or not result.stdout.startswith('-device '):
        raise SystemExit(f'{config.name}: expansion failed\n{result.stderr}')
    tokens = shlex.split(result.stdout)
    if len(tokens) % 2 or any(token != '-device' for token in tokens[::2]):
        raise SystemExit(f'{config.name}: malformed device argument pairs')
    try:
        emitted = [device_properties(token) for token in tokens[1::2]]
    except ValueError as error:
        raise SystemExit(f'{config.name}: invalid expanded properties: {error}') from error
    device = expected['device']
    if 'mode' in device:
        device['femu_mode'] = str({'ocssd': 0, 'bbssd': 1, 'nossd': 2,
                                  'znssd': 3, 'csd': 4, 'kvssd': 5}[device.pop('mode')])
    device.setdefault('id', 'nvme0')
    wanted = []
    subsystem = expected['subsystem']
    if subsystem:
        subsystem.setdefault('id', 'femu-subsys-0')
        subsystem.setdefault('nqn', 'subsys0')
        device.setdefault('subsys', subsystem['id'])
        wanted.append(('femu-subsys', subsystem))
    wanted.append(('femu', device))
    if emitted != wanted:
        raise SystemExit(f'{config.name}: expanded values differ\n{emitted}\n{wanted}')
    records.append({'config': config.name, 'arguments': tokens,
                    'stderr': result.stderr, 'exit_status': result.returncode})
    count += 1

# Earlier sections also contain INI fragments. Select the named baseline.
page = (website / 'docs/configuration-recipes.md').read_text()
section = re.search(r'^## Baseline geometry and space\n(.*?)(?=^## |\Z)',
                    page, re.M | re.S)
block = re.search(r'```ini\n(.*?)```', section.group(1), re.S) if section else None
if not block:
    raise SystemExit('Missing INI block in Baseline geometry and space')
inline = block.group(1)
def active_lines(text):
    return [line.strip() for line in text.splitlines()
            if line.strip() and not line.lstrip().startswith('#')]
if active_lines(inline) != active_lines((website / 'static/configs/blackbox.conf').read_text()):
    raise SystemExit('Displayed black-box baseline differs from its download')
if args.report:
    args.report.write_text(json.dumps(records, indent=2) + '\n')
print(f'{count} recipes passed ownership, isolated expansion, and exact property-value checks.')
print('Displayed black-box baseline matches its download.')
print('Device realization and guest execution require a built FEMU on the experiment host.')
