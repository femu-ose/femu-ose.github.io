---
title: "Qualification and errata"
description: "Track actual FEMU tutorial qualification and corrections at the frozen public source revision."
---

# Qualification and errata

Source pin: `1918eb9795baa4483e7721429db5e58c54305878`.

## Candidate release qualification

| Module | Observed result |
| --- | --- |
| S0 | Fresh NoSSD 1 MiB readback passed |
| S1 | 16 verified jobs and 16 GiB of measured writes passed |
| S2 | No-hints FDP arm passed; hinted-arm result not retrieved |
| S3 | Append readback, expected error, state walk and reset passed |
| S4 | Real vector-add passed; final stricter negative-status helper needs a rerun |
| S5 | Old image failed region commit; replacement guest-kernel qualification interrupted |
| S6 | Guest baseline failed with Invalid Opcode as expected; patched results not retrieved |

The Linux host became unreachable during final qualification. The pack records
observed terminal results and the remaining checks explicitly. Complete remote
receipts have not yet been collected. Do not advertise this candidate as a
fully qualified live event. Independent learner testing, full timing rehearsal,
participant-capacity testing and video recording are still outstanding.

## Corrections in this edition

- Device paths have no implicit default in destructive guest labs.
- C0h WAF includes mapping-page and padding-page writes.
- FDP 22h counters are decoded at their full 128-bit width.
- FDP 21h does not contain per-handle byte totals.
- CSD compute units do not make calls to the same program concurrent.
- CXL enumeration alone is not a passed memory-access exercise.
- Old October 1 performance values are historical examples, not expected
  results at this source pin.

The host could not lock the full emulated backend under its memlock limit.
Correctness checks can run, but these runs do not establish calibrated latency.
Preserve that condition with any timing interpretation.
