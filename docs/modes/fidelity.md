---
title: What the model captures
description: "Understand FEMU modeling boundaries, timing approximations, volatile storage, and the calibration evidence needed for hardware comparisons."
---

# What the model captures

FEMU models protocol handling, selected device policies, and resource-based
completion timing. Accuracy depends on the selected path and its calibration.
Use the [timing guide](/docs/timing-model) for the exact scheduling rules and
[policies](/docs/policies) for their execution boundaries.

## Modeled mechanisms

- Black-box mapping, out-of-place writes, victim selection, relocation, and erase.
- Page, DFTL translation-cost, hybrid, and FAST variants, with their documented
  allocation and merge behavior.
- Optional DRAM cache membership, write coalescing, Flush, and FUA behavior.
- Configurable NAND array times, cell/page-type tables, channel phases, and
  program/erase suspend on the adapters that enable them.
- Multi-plane erase in black-box line GC; ordinary reads/programs remain separate.
- ZNS state and resource checks, zone placement/reset, and allocated ZRWA windows.
- FDP placement and reclaim-unit management, plus separate KV and CSD paths.
- A CXL SSD (`femu-cxl-ssd`) with its own cache and media path; see the
  [CXL SSD guide](/manual/modes/cxl-ssd) and
  [choosing a mode](/manual/concepts/choosing-a-mode).
- Optional link bandwidth, propagation, and serialized firmware service.
- ECC latency tiers, read-triggered refresh, and periodic error-status insertion.

## Concrete boundaries

| Boundary | Consequence for an experiment |
| --- | --- |
| Volatile host-memory backing | Process exit/device teardown loses emulated storage; guest reset is not a supported persistence contract. `power_loss=on` simulates a power cut that drops buffered writes, not a persistent store |
| No cell voltages or raw bit-error process | ECC and refresh are timing/policy approximations, not physical reliability models |
| No general sub-page read-modify-write model | Partial-page workloads do not automatically incur a real drive's full programming cost |
| DFTL retains the complete host L2P table | Cache-size experiments model translation costs, not an equally small host-memory implementation |
| Black-box LUN gate versus ZNS plane gate | Equal geometry labels do not imply equal concurrency across modes |
| Copyback and cache-read APIs lack reviewed production callers | Unit-test coverage of the API is not an enabled workload feature |
| CSD uses explicit or scaled host execution time | Host execution on `nr_cu` compute-unit threads and simplified completion-time accounting shape results |
| Shared controller resources across namespaces | Mixed-mode comparisons include shared-thread and service-time interactions |
| Real guest and emulator scheduling | Observed completion may be later than the modeled deadline |

Report the exact source commit and configuration, not just a device-mode name.
For a claim about a particular SSD, supply calibration measurements and a
workload that exercises the mechanism being compared. The default values alone
do not establish that match.

## Implementation sources

Reviewed against FEMU [`39a55eeb637b`](https://github.com/MoatLab/FEMU/tree/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be). The examples describe this revision; see [validation coverage](/docs/implementation#validation-coverage).

- [backend/dram.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/backend/dram.c): volatile backing lifecycle
- [nand/nand-media.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/nand/nand-media.c): timing abstractions
- [bbssd/ftl-map-cmt.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl-map-cmt.c): DFTL scope
- [csd/csd.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/csd/csd.c): compute execution and compute-unit threads
