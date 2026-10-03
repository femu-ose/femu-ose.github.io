---
title: Reproducibility
description: "Preserve FEMU source, configuration, input provenance, workload state, host conditions, counters, and analysis artifacts for reproducible experiments."
---

# Using FEMU in an artifact evaluation

The emulated device is a parameter, so a result is only reproducible if the
device is described as carefully as the workload.

## Report these

1. **The commit.** Not the release, the commit. FEMU changes often.
2. **The mode**, and for a multi-namespace controller, the mode of each.
   FDP, the CXL SSD and CSD each have a paper to
   [cite alongside FEMU](/docs/research/cite).
3. **The geometry**: sector size, sectors per page, pages per block, blocks per
   plane, planes per LUN, LUNs per channel, channels. These determine capacity
   and parallelism together.
4. **Every non-default knob.** The [configuration
   reference](/manual/reference/properties) lists defaults for its pinned source revision.
   Record the complete configuration and check defaults against your commit.
5. **The preconditioning.** Whether the device was filled before measuring, and
   how, changes garbage-collection results more than most policy choices do.
6. **The host**: core count, memory, and whether the backing store was pinned.

## A configuration file is easier than a command line

FEMU ships a tool that expands an INI-style file into device arguments, which
is both easier to read and easier to attach to a paper:

```bash
bash hw/femu/scripts/ssd-config.sh my-device.conf
```

Start with a [complete configuration recipe](/docs/configuration-recipes).
Use the [observability guide](/docs/observability) to record counter snapshots,
compute interval deltas, and distinguish modeled device time from host time.

## State and host conditions

The backing store is memory. Exiting the FEMU process loses its contents;
starting a new process requires fresh preconditioning. A guest reboot does not
necessarily terminate that process, so record whether each run reused or
restarted the emulator. Record backing-store pinning failures because host
page faults can affect measured latency.

## Define what a repetition preserves

Choose the initial state before comparing policies. A new result directory or
counter snapshot does not reset device state. Consecutive workload windows in
one emulator process inherit mappings, free-space state, and any enabled model
caches from earlier windows.

| Repetition type | Preparation | What it measures |
| --- | --- | --- |
| Fresh-process repetition | Restart FEMU, recreate required data, and repeat the same preconditioning | Variation across separately initialized runs |
| Consecutive window | Keep the process and device state; save counters around each window | How behavior evolves as the workload changes device state |
| Application-cache comparison | Specify which application or guest cache is changed and retain the remaining setup | The effect of that cache preparation, with device history recorded |

Report consecutive windows as a sequence. Do not treat them as independent
fresh-state repetitions or silently compare one policy's first window with
another policy's later window. Resetting application or guest caches does not
reinitialize the device's FTL state. A fresh FEMU process does require restoring
its volatile contents before an application can use them.

Record the policy execution order and keep host conditions comparable. For each
window, retain the preconditioning history, workload seed, counter interval,
and outcome. Use the [first experiment](/docs/start-first-experiment) for the
fresh-process baseline and [counter interpretation](/docs/observability) to
check whether the intended device path was exercised.

## Preserve the build and command context

Save the compiler, Python, and Make versions with the source commit and build
log. Record the configure options and any compatibility overrides you needed.
A successful build under an override is a different environment from the
unmodified documented setup.

For each command, record whether it runs on the host or in the guest, its
working directory, and the paths of its inputs and outputs. Relative paths in
a launch script or workload configuration resolve against that directory.
Keep the actual configuration and workload files with the results, rather than
only their filenames. Record the parser or plotting-script revision used to
derive a figure from raw output.

For downloaded guest images, datasets, or workload traces, retain the source
URL, immutable revision when available, and SHA-256 of the actual input file.
A dataset name or installed package version may resolve to changing remote
content or an older cached copy. Record the resolved local path and whether
the run downloaded or reused it. Keep input acquisition outside the measured
interval unless downloading is part of the experiment.

For this site's configurations, patches, and decoder, save the
[download manifest](/downloads.json) with your results. It records each file's
SHA-256, byte size, and the documentation's FEMU implementation reference.
Compare the downloaded file's hash with its matching entry before making local
changes. Keep the original and your modified file together so the experiment
records both the published starting point and the configuration actually used.

## Move from a device workload to an application

First complete [the raw-device experiment](/docs/start-first-experiment) to
establish device identity and counter collection. For a filesystem-backed
application, prepare a filesystem on the expendable FEMU namespace and put
the application's data there. Keep the guest boot disk and result archive
separate. Filesystem creation and application loading are part of
preconditioning, outside the measured interval unless they are the workload.

Record the paths actually used by the process, not only the path in its sample
configuration. Resolve each path to its mounted filesystem and backing device.

| Workload component | What to establish before measuring |
| --- | --- |
| Database | Data files, write-ahead log, and temporary/compaction files may have separate destinations; record each one |
| Checkpoint or dataset pipeline | Record input and output locations, data size, application buffering, and when writes are considered complete |
| Filesystem workload | Record filesystem type, mount options, guest memory, and whether the run starts with warm or cold application and guest caches |
| Results and diagnostics | Save output on the guest boot disk or host so a fresh FEMU process does not erase the evidence |

Take device-counter snapshots around the same interval as the application
measurement. Check application exit status and its own operation or byte
counts alongside device activity. A completed application operation may have
been served from a cache or may leave writes pending. Specify whether the
interval includes the application's durability operation and subsequent
device Flush; a namespace Flush cannot submit bytes still held by an
application or guest filesystem.

FEMU's [page counters](/docs/observability#page-counts-are-not-application-bytes)
measure a different boundary from application throughput. Report both, with
their units. Keep application version, dataset, memory limits, filesystem,
and cache preparation fixed when changing a device policy. This checklist is
an adaptation path, not a validated database or filesystem benchmark recipe.

## Account for every attempted run

Keep a run manifest alongside the raw output. Record a run ID, policy, seed,
configuration path, start and end times, exit status, and outcome. Distinguish
successful measurements from startup rejection, workload errors, timeouts,
and missing or undecodable statistics. Preserve failed runs' logs.

Record the process exit status immediately after each workload, before another
command replaces it. An application can write valid JSON statistics and then
crash. Preserve those files as failed-run evidence, but do not count them as a
completed measurement solely because a parser accepts them. For fio, inspect
each job's error field as well as the process status.

For each policy, report how many runs were attempted, completed, and included
in the comparison, with reasons for exclusions. A timeout is not a zero-IOPS
measurement. A successful process exit does not establish that the intended
device or policy was exercised; check workload errors and counter deltas.

Choose timeout and retry rules before comparing policies, and apply the same
rules to each. Retain the original attempt when retrying and state whether
the retry reused device state or started from fresh preconditioning. Otherwise,
omitting difficult runs or changing their initial state can change the apparent
policy ranking.

## Trace each figure to its input runs

Keep downloaded reference results separate from newly measured output. Pass an
explicit run directory or file list to the plotting command. A wildcard that
selects the last filename can mix an earlier reference dataset with a partial
new experiment, even when every plotted file parses successfully.

Save a figure manifest containing the input filenames and SHA-256 hashes,
included run IDs, parser and plotting revisions, filtering rules, and output
filename. For example, a DFTL-versus-page comparison should identify each
policy's configuration, preconditioning state, and measurement interval through
its run IDs. Check that every included run passed the outcome checks above.

Replotting archived results verifies the analysis path. Label those figures as
replots and retain the original measurements' provenance. Running the workload
again produces a separate experiment with its own manifest.

## Make a policy comparison readable

For a greedy-versus-FIFO GC experiment, identify each series by its actual
`gc_policy` value. Use labels or a legend and distinct markers or line styles
so the comparison remains readable without color. Keep geometry, workload,
preconditioning, and repetition type in the caption or adjoining text; link
the configurations and run manifest beside the figure.

Decide what each plotted point represents before aggregating results:

<div className="compact-table">

| Figure element | Example and required meaning |
| --- | --- |
| Horizontal axis | Write workload rate, with units and whether it is requested or achieved |
| Vertical axis | Guest-observed p99 write latency in microseconds, naming the workload tool and measurement interval |
| Series | `gc_policy=greedy` and `gc_policy=fifo`, with the remaining configuration fixed |
| Point | One run, or an explicitly named aggregate across a stated number of fresh-process repetitions |
| Error bar | The named interval or spread across repetitions, with sample count; it is separate from the within-run p99 statistic |

</div>

A mean of per-run p99 values is not the p99 of all operations pooled together.
Retain per-run outputs and state which quantity the plot shows. Keep modeled
media timing separate from guest-observed latency in labels. Check
[counter deltas](/docs/observability) to establish whether collection occurred;
a policy label alone does not show that the selector ran.

Before publishing, inspect the exported figure at its intended display size.
Check axis units, legend entries, clipping, and every expected configuration's
presence. For automated plotting, select a noninteractive backend after any
library imports that override it, save to an explicit output path, and verify
that the command exits and produces a readable file. Preserve the plotting
environment with the manifest so another contributor can reproduce the export.
