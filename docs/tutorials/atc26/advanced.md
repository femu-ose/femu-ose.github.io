---
title: "Advanced FEMU study path"
description: "Build deeper experiments in mapping, placement, reliability, instrumentation and full-stack storage research."
---

# Advanced FEMU study path

Each study produces a reproducible artifact: hypothesis, frozen configuration,
workload, raw output, checker, explanation, and a reset procedure. These are
study assignments, not claims of freshly qualified guest labs.

| Module | Investigation | Deliverable |
| --- | --- | --- |
| A0 Foundations | Trace NVMe command, page, block, mapping and erase | Annotated request path and unit conversions |
| A1 Methodology | Separate occupancy, warm-up and measurement | Controlled comparison with repeated trials |
| A2 Mapping | Compare page mapping and DFTL translation traffic | Cache-size sweep including mapping writes |
| A3 Placement | Vary lifetime separation, groups and handles | FDP configuration and interval byte accounting |
| A4 Zoned storage | Explore active/open limits and write caches | State-machine tests and recovery trace |
| A5 KV storage | Compare packing and index choices | Key/value correctness plus space/media accounting |
| A6 CSD | Compare a real algorithm with a CPU reference | Program hash, result proof and clock scope |
| A7 CXL | Separate CPU-cache and device-cache effects | Region configuration, access trace and counters |
| A8 Reliability | Inject one supported fault with known ground truth | Expected error and recovery invariant |
| A9 Instrumentation | Trace one request across queues and timing | Source-linked timeline without double counting |
| A10 Extension | Add a small tested interface | Red/green patch and invalid-input regression |
| A11 Artifact | Exchange a complete experiment with another learner | Independent reproduction report |
| A12 Full stack | Run one application with fixed input and configuration | Application correctness and device-level evidence |
| A13 Calibration | Compare a documented hardware behavior | Calibration envelope and held-out validation |

Use the [manual](/manual/) to choose supported features at your source pin.
Do not compare incompatible interfaces as if they were the same experiment.
DFTL under FDP and non-FDP have different accounting/model details at this
edition's pin; state which path you exercised.
