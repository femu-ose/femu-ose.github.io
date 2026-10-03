---
title: Your first experiment
sidebar_position: 3
description: "Run a FEMU black-box random-write experiment with data checks, preserve workload outputs, and interpret host results alongside model counters."
---

# Your first experiment

Measure random writes on the ordinary black-box device, then use model counters
to establish what happened. Start with the
[blackbox.conf baseline](/configs/blackbox.conf) from the [configuration recipes](/docs/configuration-recipes#expand-and-launch-a-configuration).
It uses page mapping, no write buffer, and a 4 GiB namespace over 16 GiB of raw
NAND. This exercise is not a ZNS, FDP, KV, or CSD workload.

## 1. Identify the device and record the environment

Run these commands inside the Linux guest. You need `fio`, `nvme-cli`, Python 3,
and the [statistics decoder](/tools/decode-femu-stats.py) in your working directory.

```bash
lsblk -o NAME,SIZE,MODEL,MOUNTPOINTS
sudo nvme list
uname -r
fio --version
nvme version
```

Select the expendable FEMU namespace and its controller after checking the model,
capacity, and mount points. The following workload overwrites the entire selected
namespace. Use an unmounted test device, separate from the guest boot disk.

```bash
# Replace these examples with the devices you identified.
FEMU_TEST_DEVICE=/dev/nvme0n1
FEMU_TEST_CONTROLLER=/dev/nvme0
sudo nvme id-ctrl "$FEMU_TEST_CONTROLLER"
sudo nvme id-ns "$FEMU_TEST_DEVICE"
FEMU_RESULTS=$(mktemp -d "$PWD/femu-first-run.XXXXXX")
printf 'Results: %s\n' "$FEMU_RESULTS"
```

Save the source commit and expanded device arguments from the host alongside
these guest results. The command creates a new results directory for this
attempt; check that it succeeded and keep `FEMU_RESULTS` set in this shell.
Keep the emulator running between counter snapshots.

## 2. Verify a bounded write and readback

Before measuring performance, write and verify the first 64 MiB of the selected
test namespace. This uses synchronous 4 KiB I/O at queue depth one so the
correctness checkpoint is easy to interpret. It overwrites that region.

```bash
(
  if sudo fio --name=readback --filename="$FEMU_TEST_DEVICE" \
    --rw=write --bs=4k --size=64m --ioengine=psync \
    --direct=1 --iodepth=1 --verify=crc32c --do_verify=1 \
    --verify_fatal=1 --output-format=json \
    --output="$FEMU_RESULTS/readback.json" \
    2> "$FEMU_RESULTS/readback.stderr"; then
    FEMU_READBACK_STATUS=0
  else
    FEMU_READBACK_STATUS=$?
  fi
  printf '%s\n' "$FEMU_READBACK_STATUS" > "$FEMU_RESULTS/readback.exit-status" || exit 1
  test "$FEMU_READBACK_STATUS" -eq 0
)
```

Require exit status `0`, a fio job `error` of `0`, and both `read.io_bytes` and
`write.io_bytes` equal to `67108864` in `readback.json`. The write phase stores
verification headers and CRC32C checksums; the following read phase checks
returned contents. A write-only throughput result does not establish readback.
Stop on a failed or incomplete check and preserve the output before retrying.
On verification failure, fio can prepend diagnostic text to its JSON output.
Inspect both `readback.json` as text and `readback.stderr`; a JSON parse error
is not evidence that no I/O occurred.

This checks one bounded region of the running device. It does not test every
LBA, command, or concurrent I/O pattern, and it does not establish persistence
across a FEMU restart. The next fill overwrites this verification data. Repeat
the same readback and fill steps for each configuration you compare.

## 3. Fill the exposed namespace

```bash
(
  if sudo fio --name=fill --filename="$FEMU_TEST_DEVICE" \
    --rw=write --bs=1M --size=100% --ioengine=libaio \
    --direct=1 --iodepth=8 --output-format=json \
    --output="$FEMU_RESULTS/fill.json"; then
    FEMU_FILL_STATUS=0
  else
    FEMU_FILL_STATUS=$?
  fi
  printf '%s\n' "$FEMU_FILL_STATUS" > "$FEMU_RESULTS/fill.exit-status" || exit 1
  test "$FEMU_FILL_STATUS" -eq 0
)
```

Check `fill.exit-status` and fio's job errors before continuing. Stop if the
fill failed or did not write the expected namespace size.
Filling exposed capacity establishes mappings; it does not fill all raw NAND.
The baseline has substantial spare capacity, so one fill does not establish
steady-state GC behavior.

Take the initial snapshot after the fill:

```bash
sudo nvme get-log "$FEMU_TEST_CONTROLLER" \
  --log-id=0xc0 --log-len=512 -b > "$FEMU_RESULTS/before.bin" &&
python3 decode-femu-stats.py "$FEMU_RESULTS/before.bin"
```

The decoder must accept a 512-byte log and report nonzero `host_write_pages`.
If it rejects the log, check the command status, controller, and FEMU revision
before starting the measurement.

## 4. Measure a fixed interval

```bash
(
  if sudo fio --name=random-write --filename="$FEMU_TEST_DEVICE" \
    --rw=randwrite --bs=4k --size=100% --iodepth=32 \
    --ioengine=libaio --direct=1 --randseed=20260920 \
    --runtime=120 --time_based --output-format=json \
    --output="$FEMU_RESULTS/random-write.json"; then
    FEMU_FIO_STATUS=0
  else
    FEMU_FIO_STATUS=$?
  fi
  printf '%s\n' "$FEMU_FIO_STATUS" > "$FEMU_RESULTS/random-write.exit-status" || exit 1
  if [ "$FEMU_FIO_STATUS" -ne 0 ]; then
    printf 'Workload failed; preserve its output and inspect the error.\n' >&2
    exit "$FEMU_FIO_STATUS"
  fi
  sudo nvme get-log "$FEMU_TEST_CONTROLLER" \
    --log-id=0xc0 --log-len=512 -b > "$FEMU_RESULTS/after.bin" &&
  python3 decode-femu-stats.py "$FEMU_RESULTS/after.bin" \
    --before "$FEMU_RESULTS/before.bin" > "$FEMU_RESULTS/counters.json"
)
```

The parentheses scope the variables and explicit `exit` to a subshell. The
conditional captures fio's status even with `set -e` enabled; a calling shell
using that option can still stop when the whole block returns a failure.
Failure to save the status stops the block. A failed workload stops counter
collection, and a failed log command stops the
decoder. Use a fresh result directory for each attempt: files left by an earlier
run do not establish that this block succeeded. Preserve failed-run files,
correct the cause, and repeat the fill and both snapshots for a new attempt.

Read fio's error status, write IOPS, bandwidth, and completion-latency percentiles.
Then inspect `interval` in `counters.json`:

| Observation | Interpretation and next step |
| --- | --- |
| Positive `host_write_pages` | The measured writes reached the modeled device |
| Positive `gc_write_pages` | Pages were relocated; in this page-mapping baseline, inspect GC as the cause |
| Zero `gc_write_pages` | No relocation was counted; GC may not have run or may have erased fully invalid victims |
| WAF near one | Programming was close to host writes; this alone does not establish a steady-state workload |
| `null` interval WAF | No host-write pages were counted; check the workload and selected controller |
| Decreasing-counter error | Check snapshot order and whether the emulator restarted |

The fixed random seed controls fio's random sequence, not the number of requests
completed in 120 seconds. A faster configuration can issue more writes and
reach a different device state during the same interval. Record completed bytes
and operations alongside elapsed time and counter deltas. For a question about
policy behavior under a fixed amount of work, use an explicitly bounded workload
and report that amount instead of treating this time-based run as an identical
request trace. Guest and emulator scheduling can still change completion timing.

The 120-second interval is a starting point, not a convergence criterion. If
studying GC, continue with equal workload windows and separate snapshots until
you observe the intended collection behavior and assess variation across windows.
Use [GC diagnostics and counters](/docs/observability) to distinguish collection
from relocation. Do not infer activity solely from lower throughput.

## 5. Compare one policy

Before restarting, preserve the first run's files on the guest boot disk or
copy them to the host. From the guest directory used above:

```bash
findmnt -T "$FEMU_RESULTS"
tar -czf "$FEMU_RESULTS.tar.gz" -C "$FEMU_RESULTS" .
```

Check that the result directory and archive are on the boot filesystem, not
the FEMU test namespace. Copy the archive out before replacing the guest image.
Keep the original binary snapshots as well as decoded JSON so results can be
checked again. Save the host's configuration, expanded arguments, and source
commit alongside the archive.

Start a fresh emulator process with the same configuration and change only
`gc_policy` from `greedy` to `cost-benefit`. Repeat the readback, fill, and measurement with
the same seed, queue depth, durations, and geometry; save the second run in a
separate directory. See the [complete policy recipe](/configs/gc-cost-benefit.conf).

Restarting FEMU discards its emulated SSD contents, mappings, and counters.
Files on the guest boot disk have a separate lifetime determined by that disk's
backing image and snapshot options. Repeat preconditioning for the new process;
never subtract counter snapshots taken across the restart.

A policy comparison is informative only when victim selection actually occurs.
No measurable difference is a valid result when the tested workload does not
exercise that choice. Report counter deltas, latency variation, and the exact
measurement boundary rather than promising a particular improvement.

If you later enable a write buffer, account for deferred programs with an
explicit Flush boundary as described in [observability](/docs/observability).
Guest latency includes emulator and host scheduling overhead in addition to
modeled NAND timing.

Share the configuration and actual results using the
[recipe report outline](/docs/community/contributing#report-a-recipe-result).
The commands on this page are source-reviewed. For a guest-tested walk through
the same device and counters, with captured output, follow
[Tutorial 01: your first SSD](/manual/tutorials/01-first-ssd) and
[Tutorial 02: GC and WAF](/manual/tutorials/02-gc-and-waf) in the FEMU Manual.
The [fio manual](https://fio.readthedocs.io/en/latest/fio_doc.html)
describes workload size, random seeds, time-based execution, and JSON output.
