---
title: Contributing
description: "Prepare a FEMU contribution with a reproducible issue, focused patch, recipe results, and checks for concurrency and design diagrams."
---

# Contributing

## The short version

Fork, branch, change one thing, open a pull request that says what was wrong
and what the change does about it. New to the code? Follow the
[developer learning path](/docs/community/developer-path).

The repository's [CONTRIBUTING.md](https://github.com/MoatLab/FEMU/blob/master/CONTRIBUTING.md) is the rule
book; [Governance](/docs/community/governance#in-effect-today) summarizes it.
In short: open an issue before a new feature, keep behaviour changes opt-in,
add a test that fails without your change, pass `scripts/checkpatch.pl`, and
sign off every commit with `git commit -s` (Developer Certificate of Origin).
A maintainer responds within 72 hours.

## Choose the contribution destination

Send FEMU device, policy, launcher, and documentation changes to
[MoatLab/FEMU pull requests](https://github.com/MoatLab/FEMU/pulls), following
the repository's [CONTRIBUTING.md](https://github.com/MoatLab/FEMU/blob/master/CONTRIBUTING.md) and the manual's [code structure](/manual/development/code-structure) guide.
The checkout also contains QEMU's inherited `README.rst`, whose patch-email
instructions describe the upstream QEMU project.

For a change to shared QEMU code, first determine whether the behavior also
exists in current upstream QEMU. Include that comparison in the FEMU report
when available. Upstream QEMU uses its own
[contribution process](https://www.qemu.org/contribute/), with emailed patches
and a GitLab issue tracker. Follow that project's current instructions when
submitting there. A failure observed only in FEMU can start in
[FEMU Issues](https://github.com/MoatLab/FEMU/issues); describe what you reproduced
without assuming it is an upstream defect.

## Report a recipe result

Running a [configuration recipe](/docs/configuration-recipes) on your Linux/KVM
host is a useful first contribution. Follow its verification step and report
what happened, even if setup stopped before a workload ran. Share a successful
run in [Discussions](https://github.com/MoatLab/FEMU/discussions); use an
[issue](https://github.com/MoatLab/FEMU/issues) for a reproducible defect.

Copy this outline into your report:

```text
Recipe:
Changed settings:
FEMU commit and local patches:
Host OS/kernel/CPU:
Compiler/build-tool versions and configure options:
Guest OS/kernel:
Guest RAM/vCPUs:
Tool versions:
Complete INI configuration:
Expanded device arguments:
Verification/workload command:
Host or guest, and working directory:
Process exit status:
Expected result:
Actual result:
Relevant startup/guest output:
Checks reached:
- Configuration expansion:
- Device startup:
- Guest verification:
For measurements:
- Preconditioning:
- Repetitions and units:
- Counter values:
```

Record the source with `git rev-parse HEAD`. Run `uname -r` separately on the
host and guest, and record versions of the tools you used, such as `nvme version`
and `fio --version`. Include errors as text so others can search and reproduce
them. Remove credentials and private workload data from attachments.

A device that starts successfully has passed a different check from a guest
that exercises its commands. State which checks you reached; leave unrun steps
marked as unrun. A performance report should also include the baseline used for
comparison and the [counter definitions](/docs/observability).

## Building and testing

```bash
# From the FEMU checkout root:
make -C hw/femu/tests check
# Rebuild an already configured development checkout:
make -C build-femu -j"$(nproc)"
```

For a first build, use [Get started](/docs/start). Check the
[repository workflows](https://github.com/MoatLab/FEMU/tree/master/.github/workflows)
for the gates at the documented revision. A change that touches the I/O path
should also be run against a guest. Describe unit, device-initialization, and
guest testing separately so reviewers can see what each result establishes.

### Choose checks for the changed behavior

Use the affected path to choose validation, and include the exact commands and
results in your pull request. The standalone `check` target above builds only
the NAND media test; it is not a complete FTL or controller test suite.

| Change | Focused validation | Integration evidence |
| --- | --- | --- |
| NAND scheduling or latency | Add an assertion in `hw/femu/tests/unit/test-nand-media.c` with reset timelines and an independently derived expected time | Exercise the affected mode's media adapter; report geometry and enabled timing options |
| Mapping, GC, or caches | Reproduce the state transition, including a boundary such as eviction or low free space | Run guest writes and readback; compare status, data, and counter deltas, not throughput alone |
| Property or namespace initialization | Check default, valid, invalid, and incompatible settings | Start the device with each case; distinguish helper expansion from successful realization |
| NVMe command or transfer handling | Cover valid requests and invalid lengths, bounds, or namespace IDs | Record completion status and verify returned data or side effects in a guest |
| Launcher or configuration helper | Exercise documented options, aliases, defaults, and rejected values; compare the selected steps and expanded arguments | Check that an invalid configuration stops before launch and that the successful path starts the intended device |
| Website guide, recipe, or diagram | Build the website and check source links against the stated revision | Follow the changed steps; inspect diagrams on desktop and mobile, and mark unexecuted steps |

For intermittent failures, preserve the workload seed, full configuration, and
the first failing output. Include a known-good comparison when one is available.
Do not report a skipped case as passing or use a successful build as evidence
that an I/O behavior is correct.

### Test ordering and completion explicitly

For queue or worker changes, write down which events must precede others and
which may occur in either order. Assert those dependencies instead of matching
one complete log sequence. More workers or queues do not establish that a
particular run overlaps work; use a trace when overlap is part of the claim.

In a controlled I/O test without reset or queue deletion, track each outstanding
command by submission-queue ID and command ID. Check for missing or duplicate
completions, expected status, and correct readback. Keep command IDs unique
within the outstanding set so the trace can distinguish requests. Test reset
and queue teardown separately against their intended lifecycle behavior.

Preserve the failing trace, queue configuration, and repetition count for an
intermittent result. A successful repetition does not replace the failed one.
Use the [request-path guide](/docs/architecture#request-and-completion-path) to
identify the poller, shared FTL worker, and completion boundary involved.

### Review a design diagram

Review the meaning before adjusting the layout. Link each mechanism to the
reviewed source revision, distinguish shared from per-namespace state, and
check branch conditions against the functions that implement them. State
whether arrows show control flow, data movement, or required ordering.

Inspect the rendered result at its actual reading size. A successful SVG or
Mermaid render does not establish that every object is visible: check clipped
labels, zero-size shapes, overlapping nodes, and arrows that miss their
endpoints. Compare the visible paths with the intended cases, including any
omitted failure path described in the caption or adjoining text.

Check desktop and narrow layouts, diagram enlargement, keyboard controls, and
accessible names and descriptions. Preserve the diagram source and a screenshot
of the reviewed rendering with the change.

### Validate the artifact a user receives

For changes to build scripts, downloadable examples, or packaging, test the
exact distributed files in a fresh directory outside your working checkout.
A successful build in the source tree can rely on files, symlinks, or Git
metadata that the download does not contain.

| Artifact | Check from a fresh directory |
| --- | --- |
| Source snapshot | Confirm the documented scripts and build inputs are present; follow the stated build path and record whether Git metadata is required |
| Configuration and launcher | Download both files, expand the configuration, and inspect resolved paths before attempting device startup |
| Binary bundle | Record its checksum, runtime dependencies, and version output; separately verify device startup and guest behavior on the documented host |

Record the artifact URL or filename, checksum, source revision, working
directory, commands, and results. Do not substitute a source checkout for a
failing download when reporting validation. If you repair or add missing files,
report the original failure and the modified run separately.

For an optional integration, check both its absence and its enabled path.
Build with the documented base dependencies and exercise an ordinary supported
operation, then enable the integration and run its own probe. For example,
[CSD's uBPF probes](/docs/modes/csd#build-and-run-the-probes) require additional
build support. A dependency available on a contributor's machine can hide an
unconditional include, link, or initialization dependency. Record extra packages
added to make a failing setup work; preserve the original result alongside it.

## Style

Match neighboring FEMU code and the repository's QEMU style: four-space
indentation, no tabs for indentation, C block comments, and lines within eighty
columns where practical. Run QEMU's checker on your patch before sending:

```bash
# Tracked changes that have not been committed:
git diff --check HEAD
git diff HEAD -- | ./scripts/checkpatch.pl --no-signoff -
```

For committed work, check the branch's commit range instead. Set the base to
the commit immediately before your contribution, then run from the checkout
root:

```bash
# Replace this value with your actual contribution base.
FEMU_REVIEW_BASE=BASE_COMMIT
git diff --check "$FEMU_REVIEW_BASE" HEAD
./scripts/checkpatch.pl --no-signoff --branch "$FEMU_REVIEW_BASE..HEAD"
git status --short
```

The first form excludes committed changes; the second excludes uncommitted
changes. Neither includes untracked files. Inspect status and confirm that
the intended files are included before reporting a clean check. `--no-signoff`
only skips checkpatch's sign-off check while you iterate; the project requires
a `Signed-off-by` line on every commit you submit. Style results also do not
establish behavioral correctness.

## Contribute a runnable tutorial

State the required host, guest, tools, input files, and source revision before
the first command. Provide complete downloadable inputs and keep commands in
the page consistent with those files. Explain which files survive a restart.

For each checkpoint, give an observable result and how to interpret a failure.
Prefer a property that must hold, such as an assertion count or a zone-state
transition, over one machine's timing or an incidental output string. Include
the command, exit status, and relevant output from your validation run.

Report rendering and execution separately. Building a documentation page
checks its structure and links; it does not execute its shell blocks, boot a
guest, or validate a workload. Label source-reviewed, standalone-tested, and
guest-tested portions explicitly. If execution needs a dataset, hardware, or
an interactive backend, state that requirement and identify any unrun steps.

## Share a workload or result dataset

Provide the workload generator or input files, FEMU revision, complete device
configuration, and collection commands. Describe the schema and units, and
assign a stable run ID that connects raw output, counter snapshots, and each
derived summary row. State the redistribution terms for shared inputs and data.

Before sharing a processed table, reconcile its IDs against the raw archive:

- Count raw runs, unique IDs, summary rows, and duplicate IDs separately.
- List raw runs excluded from the table and the reason for each exclusion.
- Identify summary rows without corresponding raw files; explain omitted files
  or a different source archive explicitly.
- Include the processing script, revision, and command needed to rebuild the
  table, with any filtering and aggregation rules.

For example, a failed fio job can remain in the raw archive while being excluded
from a throughput comparison. Its run ID and exclusion reason should still be
recorded. Follow the [reproducibility guide](/docs/research/reproducibility) to
connect included runs to figures and preserve failed-attempt evidence.

## Commit messages

Say what was wrong first, then what the change does. A reader six months from
now needs the problem more than the diff, which they can already see.

## Prepare the pull request

Use the [repository PR template](https://github.com/MoatLab/FEMU/blob/master/.github/pull_request_template.md).
Describe the problem and resulting behavior, identify the change type, link
related issues, and report exact tests and platforms. Check only statements
your evidence supports. If a test was not run, say so and explain which check
was performed instead.

The template's mode list omits KV and CSD. Add those modes
and FDP configurations in the testing description when relevant. For an
unaffected mode, explain why it is outside the change's scope rather than
marking it tested. Include before/after screenshots for a visual change and
the source revision used to validate a design diagram.

## Changes made with coding agents

Contributions written with AI coding agents are welcome, as the repository
README says. You remain the author: read and review every generated line,
run the tests yourself, and say in the pull request description which parts
were substantially tool-generated, so reviewers know where to look harder.

## Keep the change reviewable

- It does one thing.
- It says how it was tested, specifically.
- If it fixes a bug, something in the tree now fails without it.
- For a new option, state its type, units, default, accepted values, mode
  restrictions, and compatibility effects. Explain changes to existing defaults;
  numeric settings and policy selectors do not necessarily have an “off” value.
