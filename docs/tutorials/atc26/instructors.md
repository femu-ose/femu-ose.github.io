---
title: "Instructor guide"
description: "Prepare, deliver and assess the FEMU tutorial with explicit readiness gates and recovery paths."
---

# Instructor guide

## Before offering seats

Run each promised module on the distributed image. CSD and CXL are hands-on
sessions in this edition. Do not replace a blocked lab with a demonstration
without revising the advertised offering and learner outcomes.

Check six distinct gates: source audit, standalone tests, emulator tests,
fresh guest execution, independent operator/rehearsal, and simultaneous
participant capacity. A pass at one gate does not imply the others.

## Run each session

1. Ask learners to predict one result before the mechanism explanation.
2. Spend about eight minutes on the mechanism and three on a demonstration.
3. Allow about twelve minutes for the exercise, with explicit checkpoints.
4. Ask each pair to explain one observation and one limitation.
5. Preserve a failing attempt before using the troubleshooting route.

The exact timings need a full rehearsal. Advanced controls belong in the
self-paced material, not extra live slides.

## Assessment and solutions

The learner pack includes the workbook, command-extension solution, assertions
inside each lab, and captured qualification receipts where available. Ask
learners to explain why each assertion should hold before showing the solution.

For S0, matching hashes establish data correctness. For S1/S2, the denominator
must be nonzero and raw logs must cover the same interval. For S3, verify the
state and error class, not just an error message. For S4, verify a real program
against a reference. For S5, distinguish region discovery from actual memory
access. For S6, preserve both the failing baseline and the passing patch.

## Recovery and inclusion

Prepare a spare isolated VM and a local copy of the learner pack. Offer
captured-receipt analysis when access fails, labelled as analysis rather than
a completed guest exercise. Keep source-level work available without KVM.
Use the flattened handout for screen readers and quiet review; speaker notes
contain the teaching sequence. Video captions require actual recordings.

## After the session

Record setup success, first verified I/O completion, module completion,
independent reproduction and contributor follow-through. Report denominators
and collection dates. Do not invent attendance or success-rate claims.
