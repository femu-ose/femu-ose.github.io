---
title: "Learn FEMU"
description: "Run a verified storage experiment, understand the implementation, or explore the FEMU tutorial."
---

# Learn FEMU

Choose the outcome you need. The learning path connects a prediction to a
runnable experiment, checked data, and a reproducible explanation.

| Your goal | Start here | What you produce |
| --- | --- | --- |
| Run an experiment | [Conference lab setup](/docs/tutorials/atc26/setup), then [S0](/docs/tutorials/atc26/s0) | Verified readback and a complete receipt |
| Understand or extend FEMU | [Follow one write](/docs/community/developer-path), then [S6](/docs/tutorials/atc26/s6) | A small patch with failing and passing tests |

## A complete learning path

The [ATC26 edition](/tutorials/atc26/) covers architecture, garbage
collection, FDP, ZNS, computational storage, CXL and a command extension.
Its source is frozen at `1918eb9795ba`; newer documentation does not silently
change the edition's experiments. See its [qualification record](/docs/tutorials/atc26/errata).

For a machine without Linux/KVM, use the
[standalone model exercise](/docs/community/first-test) and captured receipts
for analysis. Record that work as model testing or analysis, not a guest run.

Continue with the [advanced study path](/docs/tutorials/atc26/advanced) when you
want to investigate policies, failure models, full-stack applications or
hardware calibration. The [FEMU Manual](/manual/) remains the authority
for supported parameters and interfaces.
