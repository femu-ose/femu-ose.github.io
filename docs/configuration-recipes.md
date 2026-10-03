---
title: Configuration recipes
description: "Download complete FEMU configurations for mapping, cache, GC, timing, and device-mode experiments, with verification steps and constraints."
---

# Configuration recipes

The [download manifest](/downloads.json) records SHA-256 hashes for these
configurations and the site's patches and decoder. Save it with your results
to identify the published files before local edits.

These configurations make policy comparisons explicit. Each download is a
complete INI file, with the source revision in its header. Timing values in
illustrative experiments are chosen inputs, not measurements of a named SSD.

## Expand and launch a configuration

Use the FEMU checkout's `hw/femu/scripts/ssd-config.sh` with Bash 4 or newer.
Download [blackbox.conf](/configs/blackbox.conf) into the checkout root and run
from that directory. Help and argument expansion do not require a guest image
or a built emulator:

```bash
bash hw/femu/scripts/ssd-config.sh --help
bash hw/femu/scripts/ssd-config.sh blackbox.conf
```

After [building FEMU](/docs/start), select the executable to check property
names against that build:

```bash
export FEMU_BIN="$PWD/build-femu/qemu-system-x86_64"
(
  set -e
  "$FEMU_BIN" -device femu,help
  "$FEMU_BIN" -device femu-subsys,help
  bash hw/femu/scripts/ssd-config.sh blackbox.conf --check
)
```

The helper validates property names against `-device femu,help` and
`-device femu-subsys,help` when `FEMU_BIN` is available. Without an executable
binary it warns and still expands the file. In that case, `--check` can return
success without checking property names; read stderr and confirm which binary
is selected. `--check` does not instantiate a device or validate every value
and cross-property constraint.

An executable file alone is insufficient: if its property query fails, the
helper can also warn `keys unchecked` and return zero. The explicit queries
above display the selected build's property lists and stop this subshell on a
query failure. If either fails, resolve that binary or build error before
treating the configuration as name-checked. A successful name check still does
not prove that the device accepts the selected values or that a workload uses
the intended policy.

Section headers such as `[geometry]`, `[timing]`, and `[gc]` organize the file;
they do not create separate device-property scopes. Only `[subsys]` and
`[subsystem]` route settings to the subsystem object. For repeated device keys,
the last nonempty value wins, even under a different section header. A later
blank value is ignored and does not clear an earlier setting.

For example, this expands to `nchs=4`, not two separate channel settings:

```ini
[geometry]
nchs = 8
[timing]
nchs = 4
```

Keep each key in one place and inspect the expanded arguments before launch.
Use either the friendly `mode` key or numeric `femu_mode`; the helper rejects
nonempty values for both. These are parser rules, separate from whether the
emulator accepts the resulting property values.

Launching requires the built emulator, a [bootable guest image](/manual/getting-started/guest-image),
and the supported [Linux/KVM host](/docs/start). For the supplied files, whose
values contain no spaces, launch from Bash:

```bash
(
  FEMU_CONFIG=blackbox.conf
  FEMU_GUEST_IMAGE="$HOME/images/u20s.qcow2"
  FEMU_ARGS=$(bash hw/femu/scripts/ssd-config.sh "$FEMU_CONFIG") || exit 1
  read -r -a FEMU_DEVICE_ARGS <<< "$FEMU_ARGS"
  "$FEMU_BIN" -enable-kvm -cpu host -smp 4 -m 4G \
    -drive "file=$FEMU_GUEST_IMAGE,format=qcow2,if=virtio" \
    "${FEMU_DEVICE_ARGS[@]}" -nographic
)
```

The image path is the default output of the FEMU checkout's
`make-guest-image.sh`, which the [guest image guide](/manual/getting-started/guest-image)
describes. The subshell stops before launch if configuration expansion fails,
while keeping your interactive shell open. Inspect the error before changing or rerunning the
configuration.

The x86-64 Linux host needs [working KVM](/docs/host-resources#check-host-compatibility-first), sufficient RAM for the guest, DRAM-backed device,
and metadata, and a guest image configured for a serial console. The emulated
SSD starts empty for a new process. The qcow2 drive above is the guest boot disk,
not persistent backing for the FEMU SSD.

In the guest, confirm the intended controller and namespace with `nvme list`,
`nvme id-ctrl /dev/nvme0`, and `nvme id-ns /dev/nvme0n1`. Device numbers vary.
Use only an expendable FEMU namespace for destructive workload preparation.

## Baseline geometry and space

[Download blackbox.conf](/configs/blackbox.conf). It exposes 4 GiB over a
16 GiB raw array, with 4 KiB pages, 1 MiB blocks, eight channels, eight LUNs
per channel, and one plane per LUN. This leaves ample spare capacity for
functional experiments; choose a realistic reserve for calibrated GC studies.

```ini
[device]
mode = bbssd
devsz_mb = 4096
namespaces = 1
[geometry]
secsz = 512
secs_per_pg = 8
pgs_per_blk = 256
blks_per_pl = 256
pls_per_lun = 1
luns_per_ch = 8
nchs = 8
[timing]
pg_rd_lat = 40000
pg_wr_lat = 200000
blk_er_lat = 2000000
[gc]
gc_thres_pcent = 75
gc_thres_pcent_high = 95
```

[overprovisioned.conf](/configs/overprovisioned.conf) instead uses a 4 GiB raw
array and `op_pcent=10`. Exposed bytes are `raw × 100 / 110`, rounded to the
namespace's alignment. Use this case to control the raw-to-user capacity ratio.
Do not make `devsz_mb` equal raw geometry and assume GC still has workspace.

## Policy experiments

Each file below contains the full black-box baseline plus the listed changes.
For a comparison, keep geometry, exposed size, queue depth, preconditioning,
and all unlisted policies identical. Download a complete file from the first
column; follow a setting link for its internal design and interpretation limits.

<div className="policy-recipe-table">

| Case and complete file | Relevant settings | Verify or measure |
| --- | --- | --- |
| [GC policy](/configs/gc-cost-benefit.conf) | [`gc_policy=cost-benefit`](/docs/policies#ordinary-garbage-collection) | Compare against greedy, random, fifo, and d-choice; measure WAF and latency after sustained overwrites |
| [DFTL](/configs/dftl.conf) | [`mapping=dftl,mapping_cache_mb=4`](/docs/policies#dftl-cache-coverage-and-eviction) | Compare locality-sensitive reads and writes against page mapping |
| [Hybrid](/configs/hybrid.conf) | [`mapping=hybrid`](/docs/policies#hybrid-and-fast-allocation) | Compare sequential full-block rewrites with random updates; inspect relocation writes and the [merge counters](/docs/observability#read-the-vendor-counters) at log offsets 88 to 104 |
| [FAST](/configs/fast.conf) | [`mapping=fast`](/docs/policies#hybrid-and-fast-allocation) | Vary the number of logical blocks receiving interleaved updates |
| [Read cache](/configs/read-cache.conf) | [`read_cache_mb=64,cache_evict=lru`](/docs/policies#trace-a-cache-comparison) | Repeat a working set below/above 64 MiB; compare clock, random, and arc |
| [Write buffer](/configs/write-buffer.conf) | [`buffer_size=2048,buffer_thres_pcent=90,vwc=1,oncs=12`](/docs/policies#admission-and-eviction-example) (`oncs` 0x4 Dataset Management plus 0x8 Write Zeroes) | Compare repeated writes with unique writes; measure Flush and FUA separately |
| [QLC tables](/configs/qlc.conf) | [`nand_cell_type=4`](/docs/timing-model#flat-timing-and-cell-type-timing) | Table timing supersedes the baseline flat latencies |
| [Channel and suspend](/configs/channel-suspend.conf) | [Bus phases](/docs/timing-model#channel-bus-phases) plus [`pe_suspend=1,tsusp_ns=5000`](/docs/timing-model#ecc-cost-age-and-suspend) | Compare reads arriving during long program/erase occupancy; repeat with suspend off |
| [Refresh and ECC](/configs/refresh.conf) | [ECC tier 1000 ns](/docs/timing-model#ecc-cost-age-and-suspend); age tier 60 s; [refresh at 10000 reads or 120 s](/docs/policies#refresh-admission-and-execution) | Read to queue refresh, then write to execute it; inspect separate refresh counters |

</div>

The refresh recipe deliberately accelerates age and stress thresholds for
observation. It does not represent a flash endurance calibration. Set one
mechanism at a time for causal comparisons.

For refresh tests, first write enough unique pages to close lines. A read-stress
test must send repeated reads through NAND, so disable the read cache or use a
workload that misses it. For age refresh, wait after line closure, then read
that data and issue a write. Keep spare lines available and compare the
appropriate refresh counter before and after. A small write followed by a wait
can leave only an active line and produce no age refresh. The
[refresh decision diagram](/docs/policies#refresh-admission-and-execution)
explains nomination, deferral, and cancellation.

For error-status experiments, add `err_read_unc_ppm=1000` or
`err_write_fail_ppm=1000` to a black-box configuration. The corresponding path
injects every thousandth operation. Compare error status and media-error
counters, not only application throughput.

Injection counts requests reaching the dispatcher, not pages or physical NAND
operations. Keep request size and retry behavior fixed, and start each run with
fresh counters. A buffered write or cached read can still receive failure
status. See the [injection diagram](/docs/policies#error-injection) for ordering
and the [ZNS procedure](/docs/modes/zns#injected-write-faults) for zone-state
effects when applying the write-rate property to a zoned device.

## Device-interface experiments

| Complete file | Configuration | Verification |
| --- | --- | --- |
| [FDP](/configs/fdp.conf) | Black-box plus a linked subsystem; four handles, one reclaim group | Identify placement capability, run host placement commands, read FDP logs |
| [ZNS](/configs/zns.conf) | 4 GiB, QLC, 16 zones of 256 MiB, eight open and 16 active | Report zones, append sequentially, close/finish/reset, and check state |
| [KV](/configs/kv.conf) | `mode=kvssd` with black-box geometry | Run the [KV probe](/manual/modes/kvssd#with-kv-probe) on the controller or generic node; do not expect a normal block workload |
| [CSD](/configs/csd.conf) | `mode=csd,fdm_size=64,nr_cu=4,csf_runtime_scale=3` | Run the CSD passthrough smoke test; add a program directory for native/uBPF code |
| [NoSSD](/configs/nossd.conf) | `mode=nossd,hiops_inline=on` | Check enumeration and host-stack throughput without flash timing |
| [NoSSD with service costs](/configs/nossd-link.conf) | 4000 MB/s link, 1000 ns propagation, 500 ns firmware service | Compare with pure NoSSD; the inline shortcut is disabled by these costs |
| [Mixed namespaces](/configs/mixed.conf) | Three 2 GiB namespaces: black-box, ZNS, NoSSD | Identify each NSID and verify its command set; controller resources remain shared |
| [Historical OpenChannel](/configs/openchannel.conf) | `mode=ocssd,lver=2` and `l*` geometry | Use a compatible LightNVM host or explicit OpenChannel passthrough |

### FDP object placement

`fdp` and `fdp.*` belong to the subsystem. The helper emits both objects and
links them. An equivalent device argument pair is:

```text
-device femu-subsys,id=subsys0,fdp=on,fdp.nruh=4,fdp.nrg=1,fdp.nru=256
-device femu,devsz_mb=4096,namespaces=1,femu_mode=1,subsys=subsys0
```

For the baseline geometry one reclaim unit is a 64 MiB superblock. Leave
`fdp.runs` unset or set it to that exact geometry-derived byte count. Use
`gc_strategy=0`, `1`, `2`, or `4` for FDP policy comparisons. Do not add
`buffer_size`, `hot_cold_sep`, `read_reclaim_limit`, `retention_limit_sec`,
`ecc_retention_sec`, `trim_lat_ns`, a `mapping` other than `page`, or a
`gc_policy` other than `greedy`: under FDP each fails realize. The manual's
[FDP feature page](/manual/features/fdp) lists the other FDP refusals.

### ZNS resource and timing cases

Start from the ZNS download. Set `zns_chnls_per_zone=1` to use narrower channel
groups, then verify the changed zone geometry with Identify and Report Zones.
`zns_max_open` must not exceed the zone count or a nonzero active-zone limit.
Use `zns_zone_cap` in bytes to expose less writable space than the zone size.

For a ZRWA experiment, add all three settings together:

```ini
zns_zrwa_size = 64
zns_zrwafg_size = 16
zns_zrwa_num = 4
```

The first two are logical-block counts. Allocate a ZRWA using the appropriate
zone-management command before issuing out-of-order writes. Merely setting the
properties does not make all zones random-writable. See [ZNS](/docs/modes/zns).

### Lists on the raw QEMU command line

The helper takes plain comma-separated INI values. On the raw command line,
quote the argument and double each list comma:

```bash
-device 'femu,devsz_mb=6144,namespaces=3,femu_mode=1,namespace_modes=bbssd,,znssd,,nossd,namespace_sizes=2G,,2G,,2G'
```

The doubled commas are QEMU escaping, not missing entries. Empty entries are
not namespace defaults. FDP and OpenChannel cannot use this mixed setup.

## Common rejected configurations

| Symptom | Check |
| --- | --- |
| Insufficient GC reserve | Reduce exposed capacity, set suitable over-provisioning, or increase raw geometry |
| Unknown mapping or policy | Use the exact case-sensitive names in [Policies](/docs/policies) |
| A knob has no effect under FDP | Remove the rejected ordinary-FTL setting; choose an FDP-supported experiment |
| ZNS cell type has no timing | Supply all three array latency overrides for MLC or PLC |
| ZNS open/active limit rejected | Compare each limit with the actual number of zones |
| Namespace list count mismatch | Provide one nonempty item per namespace and escape QEMU commas |
| Missing CSD device memory | Set nonzero `fdm_size` in MiB |
| Metadata setting rejected | `meta` works on NoSSD and black-box namespaces only, needs a matching `mc` bit, and is refused with FDP, `dpc` or `dps`; see [metadata and protection information](/manual/features/ns-management-and-pi#metadata-and-protection-information) |

Archive the expanded arguments, startup log, source SHA, and guest versions
with each measurement. Use [observability](/docs/observability) to check that
the intended path actually ran. Share your guest validation using the
[recipe-result outline](/docs/community/contributing#report-a-recipe-result).

## Implementation sources

Reviewed against FEMU [`39a55eeb6`](https://github.com/MoatLab/FEMU/tree/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be). The examples describe this revision; see [validation coverage](/docs/implementation#validation-coverage).

- [scripts/ssd-config.sh](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/scripts/ssd-config.sh): INI syntax, object routing, validation and comma escaping
- [scripts/configs/bbssd.conf](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/scripts/configs/bbssd.conf): upstream black-box example
- [bbssd/bb.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/bb.c): reserve and FDP checks
- [femu.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/femu.c): namespace parsing and explicit over-provisioning
- [zns/zns.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/zns/zns.c): ZNS geometry and resource constraints
