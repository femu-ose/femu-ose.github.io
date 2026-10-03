---
title: No SSD
description: "Use FEMU NoSSD as a DRAM-backed NVMe control condition and understand its timing path, configuration, and excluded flash behavior."
---

# No SSD

:::tip[Design note]

This page traces the NoSSD implementation through the source. For launch lines, guest commands, limits and verification, use the [NoSSD guide in the FEMU Manual](/manual/modes/nossd).

:::

`femu_mode=2` exposes an NVMe read/write device backed by host DRAM without a
flash translation or NAND timing model. Use it to study the guest/emulator I/O
path and as a baseline for the cost added by other modes.

```mermaid
flowchart LR
  accTitle: NoSSD request completion
  accDescr: The poller validates I/O and transfers payload bytes through DRAM. Inline eligibility and optional controller costs determine completion processing.
  Q[Submission queue] --> P[Poller and validation]
  P --> D[DRAM payload transfer]
  D --> I{Inline eligible?}
  I -->|Yes| C[Post completion]
  I -->|No| T[Completion scheduling and configured service costs]
  T --> C
```

[Download nossd.conf](/configs/nossd.conf). `hiops_inline=on` is the default;
eligible requests bypass the FTL-ring round trip. A mixed controller still
routes each namespace according to its actual mode.

For an explicit controller-service model, use
[nossd-link.conf](/configs/nossd-link.conf), which adds 4000 MB/s link bandwidth,
1000 ns propagation, and 500 ns firmware service. These settings disable the
pure inline shortcut. They are illustrative values, not a hardware calibration.

## Completion routing

Inline completion requires all of the following: the controller's base mode is
NoSSD, `hiops_inline=on`, the request belongs to a NoSSD namespace, both link
properties are zero, and `fw_cpu_ns=0`. Setting `hiops_inline=on` alone therefore
does not establish which path a request takes.

| Configuration | Completion path |
| --- | --- |
| NoSSD controller and namespace, inline enabled, no link or firmware costs | Post the completion in the submission-queue sweep; batch its interrupt at sweep end |
| Same device with inline disabled or an added service cost | Enqueue the request; the completion handler applies configured costs and waits for its deadline |
| NoSSD namespace on a controller whose base mode is not NoSSD | Use the ring path, even though the namespace has no NAND model |
| Another mode's namespace on a NoSSD controller | Dispatch according to that namespace; it cannot take the NoSSD inline shortcut |

The ring path does not by itself imply a separate FTL worker. When
`use_ftl_thread` is false, `nvme_process_cq_cpl()` drains `to_ftl` directly.
When a controller needs the worker, the completion handler drains `to_poller`
after worker processing. Keep controller mode and per-namespace mode in the
experiment record, especially for mixed controllers.

The inline sweep also stops before consuming another submission when its
active completion queue is full. This preserves unread completion entries;
queue depth and guest completion consumption still matter without NAND delay.

## Isolate the cost you are measuring

Compare three cases with the same workload and thread placement: the default
inline path, `hiops_inline=off` with all service costs zero, and the link/firmware
recipe above. The second case exposes ring and completion-scheduling overhead;
the third adds modeled service costs as well. A direct comparison between the
first and third changes both mechanisms.

For a 4 KiB request, the example link takes `4096 × 1000 / 4000 = 1024 ns`.
With idle timelines, propagation and firmware service bring the modeled
deadline increment to `1024 + 1000 + 500 = 2524 ns`. This is not a prediction
of guest-observed latency. See the [queued example](/docs/timing-model#worked-example-link-directions-and-shared-firmware)
for how later requests wait on shared resources.

`queues`, `multipoller_enabled`, and `poller_ratio` affect available queue and
poller concurrency. The source includes `run-nossd-hiops.sh` and a `hiops/`
workflow for host checks, VM launch, preparation, pinning, and measurement.
Inspect host-specific paths and affinity settings before using them.

Verify read/write correctness first, then report guest vCPUs, emulator thread
placement, queue count, queue depth, I/O size, and the inline/link settings.
NoSSD results contain software, DMA, and host scheduling costs; they are not
an estimate of zero-latency physical SSD throughput.

## Implementation sources

Reviewed against FEMU [`39a55eeb637b`](https://github.com/MoatLab/FEMU/tree/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be). The examples describe this revision; see [validation coverage](/docs/implementation#validation-coverage).

- [nossd/nop.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/nossd/nop.c): NoSSD handler
- [nvme-io.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/nvme-io.c): inline eligibility and completion costs
- [scripts/run-nossd-hiops.sh](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/scripts/run-nossd-hiops.sh): queue/poller example
- [docs/HIOPS.md](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/docs/HIOPS.md): measurement workflow
