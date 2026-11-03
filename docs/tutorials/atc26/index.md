---
title: "FEMU ATC26 tutorial"
description: "A frozen hands-on FEMU edition with seven sessions, verified lab contracts, slides and instructor guidance."
---

# FEMU ATC26 tutorial

**Edition:** public FEMU `1918eb9795baa4483e7721429db5e58c54305878`.
This is a candidate edition. Final Linux/KVM qualification was interrupted
by loss of host connectivity. Check the per-module status before assigning an
exercise. Session timing has not yet been independently rehearsed.

[Prepare your environment](/docs/tutorials/atc26/setup) ·
[Get the learner pack](/docs/tutorials/atc26/downloads) ·
[Read corrections and qualification](/docs/tutorials/atc26/errata)

## What you will learn

Follow an I/O through the full system, verify returned data, measure media
work, explain host/device responsibilities, and package a reproducible change.

| Time | Session | Checkpoint |
| --- | --- | --- |
| 13:15–13:45 | [S0: Follow one I/O](/docs/tutorials/atc26/s0) | Exact readback match |
| 13:45–14:15 | [S1: GC and WAF](/docs/tutorials/atc26/s1) | Verified writes and interval accounting |
| 14:15–14:30 | Break | |
| 14:30–15:00 | [S2: FDP](/docs/tutorials/atc26/s2) | Same workload, different placement |
| 15:00–15:30 | [S3: ZNS](/docs/tutorials/atc26/s3) | State, write pointer and expected rejection |
| 15:30–16:00 | [S4: Computational storage](/docs/tutorials/atc26/s4) | Real computation matches its reference |
| 16:00–16:30 | [S5: CXL](/docs/tutorials/atc26/s5) | Usable region, readback and counters |
| 16:30–17:00 | [S6: Extend and reproduce](/docs/tutorials/atc26/s6) | Red/green regression and artifact handoff |

Each exercise begins with a prediction and ends with evidence. Only the
paired placement experiments support a controlled performance comparison.
ZNS, CSD and CXL change the interface and answer different questions.

[Instructor guide](/docs/tutorials/atc26/instructors) ·
[Community help](/docs/community) · [How to cite FEMU](/docs/research/cite)

Videos are not yet recorded. The learner pack includes speaking notes and
worksheets; no recording is implied by those materials.
