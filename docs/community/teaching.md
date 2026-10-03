---
title: Teach with FEMU
description: "Choose FEMU teaching activities with prerequisites, student deliverables, assessment checkpoints, and guidance for group sessions."
---

# Teach with FEMU

Use FEMU to connect storage algorithms, implementation paths, and observable
results. Start with a standalone model test when students do not have a
Linux/KVM host. Add guest experiments after preparing and verifying that
environment. The activities below share source revision `9d176f89138d`.

## Choose an activity

| Learning objective | Activity | Prerequisites | Student deliverable |
| --- | --- | --- | --- |
| Derive and test a timing boundary | [Your first model test](/docs/community/first-test) | Git, Make, GNU C11 compiler; basic C | Three independently derived assertions, failing and passing output, and an explanation of timeline resets |
| Distinguish data movement from modeled time | [Follow one write](/docs/community/developer-path#2-follow-one-black-box-write) with the [architecture diagrams](/docs/architecture) | Source reading; a prepared debug build and guest for interactive tracing | A function-level path identifying payload, mapping, scheduling, and completion |
| Design a controlled policy comparison | [Your first experiment](/docs/start-first-experiment) and [policy recipes](/docs/configuration-recipes) | Linux/KVM, guest image, expendable namespace, fio and nvme-cli | Configurations, run status, counter deltas, and an explanation of whether the selected policy was exercised |
| Prepare a contribution | [Contributing](/docs/community/contributing) | One completed activity | A focused patch or reproducible documentation report with validation evidence |

The standalone exercise was executed with Apple Clang on macOS: the baseline
passed 46 assertions and the added boundary cases passed 49. A deliberate
boundary defect failed the new test. Guest tracing and policy workloads remain
source-reviewed examples awaiting Linux/KVM execution. Classroom timing and
student completion rates have not been measured.

## Prepare the environment

Before assigning an activity, run it on the same environment students will use.
Record the source revision and compiler/tool versions. Keep the unmodified
checkout separate from exercise changes, and make the
[boundary-test patch](/tutorials/ecc-boundary.patch) available for comparison.

For guest labs, check [host resources](/docs/host-resources) and
[guest-image requirements](/manual/getting-started/guest-image). Prepare a separate guest image
and result directory per student or group. Confirm the test namespace is not
the boot disk. Record whether each attempt restarts or reuses the emulator;
restarting discards the emulated SSD's contents and counters.

If a student cannot run a guest, assign source tracing and the standalone test.
Their report should identify the guest steps left unrun. Source reasoning is
useful evidence, but it does not supply a measured latency or command result.

## Run a group session

Start every group with the same source revision and a successful baseline.
Choose one activity per group from the table above; students do not need to
complete every device mode before investigating a specific mechanism.

1. **Predict.** Record the expected assertion, state transition, or counter
   change with its diagram and function. Check that the prediction follows
   the selected execution path.
2. **Run.** Save the exact patch or configuration, commands, exit statuses,
   and raw output. Verify the baseline before making the controlled change.
3. **Explain.** Compare the expected and observed results, identifying the
   first difference. Check agreement among comments, units, commands, and
   outputs.
4. **Hand over.** Supply the source revision, prerequisites, reset procedure,
   and smallest reproducing sequence. Have another group repeat the result
   without a live explanation from its authors.

For the standalone activity, exchange the boundary-test patch and failing and
passing logs. For a guest activity, also exchange the namespace identity and
whether the emulator was restarted or reused. Keep independent result
directories when groups share a host. Record a blocked step and its error
instead of substituting another group's output as a completed run.

End with one unresolved question or a reproducible documentation correction.
Use the [recipe report outline](/docs/community/contributing#report-a-recipe-result)
to carry a finding into contributor review.

## Assess the reasoning

- Require an expected result derived before changing the model or test.
- Ask which state is reset, which state persists, and why that affects the result.
- Check that a reported policy difference actually exercises the policy's code
  path. No difference can be a valid result when GC never selects a victim.
- Require failed attempts and their exit statuses alongside successful results.
- Ask students to distinguish standalone assertions, guest behavior, modeled
  time, and host scheduling overhead.

Students can discuss findings through [Community](/docs/community). Instructors
can report missing prerequisites or unclear steps using the
[recipe report outline](/docs/community/contributing#report-a-recipe-result).
