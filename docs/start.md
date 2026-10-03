---
title: Get started
sidebar_position: 1
slug: /start
description: "Build FEMU on an x86-64 Linux host with KVM, prepare a guest image, attach a device, and reach your first verified storage experiment."
---

# Get started

FEMU runs on an x86-64 Linux host with KVM. You build it once, make a guest
image, and boot the guest with an emulated NVMe device attached. Reserve RAM
for the guest, the DRAM-backed SSD, and its metadata.

## Choose your first result

| Goal | Start with | Check |
| --- | --- | --- |
| Test a device interface | The [mode guide](/manual/concepts/choosing-a-mode) for that interface | Identify data, command status, returned data, and state transitions |
| Compare a policy | A [configuration recipe](/docs/configuration-recipes) and fixed workload | Counter deltas and latency across otherwise identical runs |
| Evaluate an application | [Application workload preparation](/docs/research/reproducibility#move-from-a-device-workload-to-an-application) after the raw-device baseline | Data placement, cache state, and application results paired with device counters |
| Understand or extend the model | The [developer path](/docs/community/developer-path) | A source trace and focused regression test |
| Start contributing without a guest | [Your first model test](/docs/community/first-test) | Three new boundary assertions and a passing standalone test |
| Teach storage systems | [Teach with FEMU](/docs/community/teaching) | Activity prerequisites, validation status, and assessment checkpoints |

For a laptop or multi-device experiment, check the
[host resource guide](/docs/host-resources) before selecting capacity. A
standalone NAND test needs no guest; the documented full-system path needs
[an x86-64 Linux host with working KVM](/docs/host-resources#check-host-compatibility-first). Matching a real SSD's performance also requires
[calibration](/docs/modes/fidelity), beyond successful device enumeration.

## Build, boot and verify

The [FEMU Manual](/manual) carries the supported path, guest-tested at the
commit it documents. Follow it in order:

1. [Requirements](/manual/getting-started/requirements): host OS, KVM, memory,
   and the guest kernel each mode needs.
2. [Build FEMU](/manual/getting-started/build): dependencies,
   `femu-compile.sh`, and the errors a first build hits.
3. [Guest image](/manual/getting-started/guest-image): `make-guest-image.sh`
   builds a guest with a serial console, SSH and the NVMe tools.
4. [Quick start](/manual/getting-started/quick-start): boot a guest with a
   BlackBox SSD and check what it sees.

Then work through the [tutorials](/manual/tutorials), starting with
[your first SSD](/manual/tutorials/01-first-ssd) and
[garbage collection and WAF](/manual/tutorials/02-gc-and-waf). Each one prints
the output you should see at every step.

For a laptop or a multi-device experiment, size the host first with the
[host resource guide](/docs/host-resources). If a launch fails, the console
stays blank, or the namespace is missing, see
[setup troubleshooting](/docs/troubleshooting) and the manual's
[troubleshooting FAQ](/manual/troubleshooting).

## Run and inspect an experiment

Use [your first experiment](/docs/start-first-experiment) on the expendable FEMU
namespace. Guest-observed latency includes model timing and host/emulator
execution overhead. Payload bytes are held in host DRAM, not a persistent SSD
image; a new emulator process starts with a fresh device.

Continue with the [mode guides](/manual/concepts/choosing-a-mode), the
[design notes](/docs/implementation), and
[counter interpretation](/docs/observability).
