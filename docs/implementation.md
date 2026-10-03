---
title: Design and implementation
description: "Explore FEMU architecture and policy diagrams, connect features to source and configurations, and inspect the documented validation coverage."
---

# Design and implementation

import DesignFigure from '@site/src/components/DesignFigure';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export const DiagramPreview = ({src, alt}) => <img src={useBaseUrl(src)} alt={alt} loading="lazy" />;

FEMU presents NVMe devices to a real guest and models selected storage
behaviors inside QEMU. This guide connects user-visible features to their
configuration, execution paths, and measurement limits.

The source baseline is **39a55eeb6, October 2, 2026**, the commit the
[FEMU Manual](/manual/) on this site is mirrored from. Use the same revision
when reproducing the recipes. Later changes may alter defaults, validation,
commands, or timing. The [property reference](/manual/reference/properties) is
generated from the source, while the explanations here follow the functions
that consume those properties. Measurements below name the revision they were
taken at.

## Architecture at a glance

<DesignFigure src="/img/manual/arch-layers.svg"
  alt="FEMU's six layers from the guest-visible interface to the memory backend, with source files and threads"
  caption="From the FEMU Manual: a request crosses several independently configurable layers, each with its own source files and thread. Follow the architecture guide for function-level read, write, and initialization paths." />

## Explore the internal design

<div className="design-guide-grid">
  <Link to="/docs/architecture"><DiagramPreview src="/img/manual/arch-io-write.svg" alt="Write-path timing diagram preview" /><strong>Controller and I/O architecture</strong><span>Queue processing, payload DMA, namespace isolation, worker ownership, and completion deadlines.</span></Link>
  <Link to="/docs/policies"><DiagramPreview src="/img/manual/ftl-gc.svg" alt="Line states and GC diagram preview" /><strong>Mapping, cache, and GC policies</strong><span>Selection rules, state transitions, compatibility limits, and interactions that change experiments.</span></Link>
  <Link to="/docs/policies#dftl-cache-coverage-and-eviction"><DiagramPreview src="/img/manual/ftl-mapping.svg" alt="Mapping schemes diagram preview" /><strong>DFTL translation and eviction</strong><span>Cache coverage, CLOCK replacement, dirty-page writeback, and translation traffic across LUNs.</span></Link>
  <Link to="/docs/timing-model"><DiagramPreview src="/img/manual/nand-timing.svg" alt="NAND operation timing diagram preview" /><strong>NAND timing and contention</strong><span>A verified three-read example, array gates, channel phases, suspend behavior, and completion latency.</span></Link>
  <Link to="/docs/modes/fdp"><DiagramPreview src="/img/manual/fdp-placement.svg" alt="FDP placement diagram preview" /><strong>Placement and reclaim-unit design</strong><span>Host directives, fallback behavior, handle indirection, unit rotation, and isolation-specific reclamation.</span></Link>
  <Link to="/docs/modes/zns"><DiagramPreview src="/img/manual/zns-states.svg" alt="Zone state machine preview" /><strong>Zone state and resource ownership</strong><span>Open versus active limits, write-pointer transitions, automatic closing, and an eight-step resource experiment.</span></Link>
  <Link to="/docs/modes/kv"><DiagramPreview src="/img/manual/mode-kv.svg" alt="KV-SSD index, value arena and NAND model preview" /><strong>Key-value storage and compaction</strong><span>Index updates, payload bytes, physical-page tracking, overwrite accounting, and allocation-triggered compaction.</span></Link>
</div>

Pair a design with a [complete configuration recipe](/docs/configuration-recipes)
and its verification steps. The figures describe code paths; they do not imply
that a workload reaches every mechanism shown.

## Design by device interface

The command interface determines which implementation runs. Start with the
row matching your guest workload before transferring assumptions from another
mode. Each linked guide includes its own flow diagram and source locations.

| Interface | Internal design to inspect | Concrete checkpoint |
| --- | --- | --- |
| [Black-box block I/O](/docs/modes/blackbox) | Logical and reverse maps, allocation classes, buffer admission, cache lookup, and line GC | Does the workload cause media operations and victim collection? |
| [ZNS](/docs/modes/zns) | Zone states, write pointers, open/active accounting, and plane-gated timing | Follow the [eight-step resource experiment](/docs/modes/zns#distinguish-open-and-active-limits) through both limit failures |
| [FDP](/docs/modes/fdp) | Placement-handle resolution, current reclaim units, and numeric GC strategy | Are intended handles used, or are writes falling back to handle 0? |
| [Key-value](/docs/modes/kv) | Per-namespace key index, append area, physical pages, and value compaction | Run the namespace-1 probe and distinguish its covered commands from List and capacity-pressure cases |
| [Computational storage](/docs/modes/csd) | Device-memory ranges, program loading, and execution on compute-unit threads | Separate phantom, native, uBPF, and MRS smoke results |
| [NoSSD](/docs/modes/nossd) | DRAM transfer and inline eligibility, with optional controller costs | Confirm whether link or firmware settings disable the inline path |

OpenChannel is a [historical interface](/docs/modes/ocssd) with different guest
requirements. Support boundaries and test evidence are listed below; a shared
media API does not make all device modes interchangeable.

### Example: why changing GC policy may produce no difference

`gc_policy` selects a closed victim line; it does not decide when a line closes
or when GC pressure begins. A fresh device with few invalid pages may never
reach selection. Even under pressure, background GC can reject the chosen
victim after selection because it lacks enough invalid pages. That attempt
does not search for a second candidate.

<DesignFigure src="/img/manual/ftl-gc.svg"
  alt="Black-box line states and garbage collection, with when background and foreground GC run and how each gc_policy picks a victim"
  caption="From the FEMU Manual. A policy comparison must reach victim selection and collection. The policy guide connects each stage to configuration and source." />

For a controlled comparison, keep geometry, occupancy, mapping, buffering, and
GC timing settings identical. Change the selector, use a workload with
overwrites and sufficient pressure, and report GC writes together with host
writes and free-space behavior. See [policy interactions](/docs/policies)
and [counter interpretation](/docs/observability) before attributing a latency
difference to victim selection.

## Read by task

| Task | Start here | What it explains |
| --- | --- | --- |
| Understand an I/O request | [Architecture](/docs/architecture) | Pollers, namespace dispatch, media scheduling, completion, data storage |
| Compare GC, mapping, or cache policies | [Policies](/docs/policies) | Selection rules, defaults, interactions, and implementation limits |
| Change device timing | [Timing model](/docs/timing-model) | Array gates, channel phases, cell types, suspend, host-link costs |
| Configure an experiment | [Configuration recipes](/docs/configuration-recipes) | Complete device configurations and the cases they exercise |
| Interpret measurements | [Observability](/docs/observability) | Standard SMART, vendor counters, WAF, repeatability |
| Look up a property | [Property reference](/manual/reference/properties) | Declaration, type, default, object, source link |
| Choose a command interface | [Choosing a mode](/manual/concepts/choosing-a-mode) and [device modes](/docs/modes) | Every `femu_mode`, including the CXL SSD, and which features combine |

## Support is specific to a path

| Feature family | Implemented path | Important boundary |
| --- | --- | --- |
| Page, DFTL, hybrid, FAST mapping | Ordinary black-box FTL | FDP rejects non-page mapping; KV has its own index and reclamation |
| Five named line-GC policies | Ordinary black-box FTL | FDP selects reclaim units through numeric `gc_strategy` |
| Read cache and write buffer | Black-box read/write path | Different structures and different effects; FDP rejects the write buffer |
| NAND array timing | Shared media API and mode adapters | Black-box gates on a LUN; ZNS gates on a plane |
| Page-type timing and ECC latency | Black-box media adapter | No cell voltage or bit-error simulation |
| Zone state, append, reset, ZRWA | ZNS command handler | Uses the ZNS geometry and timing properties |
| Placement identifiers and RU handles | FDP black-box path | Exactly one namespace and one reclaim group |
| Key operations and value compaction | KV handler and KV FTL | nvme-cli passthrough, separate from an ordinary block workload; see the [manual's KV page](/manual/modes/kvssd) for the node and kernel requirements |
| Program execution and device memory | CSD handler | Native libraries and optional uBPF; programs run on `nr_cu` compute-unit threads (`femu-csd-cu`), not the poller |
| Host-link and firmware service time | Completion path | Optional costs also affect NoSSD |

## Validation coverage

The documentation was produced by tracing property declarations, validation,
command dispatch, policy registries, media adapters, and measurement code.
At `39a55eeb6`, the standalone NAND media test passed **46 assertions** on a
macOS host, covering ECC, channel scheduling, plane gating, multi-plane erase,
copyback, and suspend, and the hybrid-mapping oracle test passed 40. The same
`make -C hw/femu/tests check` target also builds CXL page-table, caching-ring
and, with GLib, CXL cache tests; the CXL page-table test uses Linux's
`mincore()` signature and does not compile on macOS. A test of a media API does
not establish that every mode calls it. The manual's
[testing guide](/manual/guides/testing) lists every test layer.

The remaining measurements in this section were taken at the earlier revision
`9d176f89138d` and were not repeated at `39a55eeb6`.
The three priority-queue tests also passed under AddressSanitizer and
UndefinedBehaviorSanitizer in an isolated macOS build using the repository's
small header stub and host GLib. They cover pop order, changing an already
updated priority, and random-pop replacement repair. This was separate from
QEMU's configured Meson build and from controller execution.

An isolated GC-selector harness passed **34 cases** using that revision's callback
bodies and priority-queue implementation under the same sanitizers. It checks
all five selectors for empty queues, background qualification, forced selection,
detachment, and queue reuse, with ranking checks for greedy, FIFO, and
cost-benefit. Two deliberate mutations fail the expected assertions. The
harness supplies reduced structures and a fixed clock; it does not execute
device initialization, relocation, FDP, or guest I/O. These results support the
[selector contract](/docs/community/developer-path#worked-boundary-add-a-line-gc-selector),
not a measured comparison of policy performance.

Configuration files accompanying the recipes are checked against the extracted
property declarations and expanded with the source configuration helper. This
checks names, object placement, and expansion; it does not replace QEMU device
realization or guest execution. Linux/KVM guest workloads were not run on the
macOS review host. Use each recipe's verification step on the experiment host
before collecting results.

## What the configured CI checks

The [workflow at the reviewed revision](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/.github/workflows/ci.yml)
defines the following checks. This describes configuration, not an independently
observed successful GitHub Actions run.

| Check | Scope | Boundary |
| --- | --- | --- |
| Standalone and Meson unit tests | NAND media, hybrid-mapping oracle, CXL page-table, caching-ring and cache tests standalone; NAND media and priority queue through Meson | Selected API cases, not every mode's workload |
| Mode initialization | Modes 0 through 5 under the qtest accelerator, which must run until the timeout | Starts devices without booting a guest |
| Controller qtests | About 400 registered cases spanning queues, data transfers, namespaces, modes, and counters | Synthetic controller requests without KVM; registration is not observed execution |
| Documentation checks | Generated property reference, relative links, tagged command examples realized under qtest, and the generated mode table | Checks the manual against the tree; the examples get one write and read, not a workload |
| Configuration helper tests | Expand examples and realize devices, with a negative control | Does not execute the corresponding experiment |
| Debug build | Address/undefined-behavior sanitizers and FTL assertions, with the qtests split over four parallel parts | Covers the operations exercised by these checks |
| Script checks | `bash -n` on the device test script and every copied `run-*.sh` | Syntax only; guest commands are not run |

The build job runs on each entry of its matrix, Ubuntu 22.04 and 24.04. The
debug and compatibility jobs select Ubuntu 24.04. Guest workloads, policy
comparisons, and hardware calibration need additional execution evidence, as
described in [validation coverage](#validation-coverage) and the manual's
[testing guide](/manual/guides/testing).

### Controller test selection

The workflow selects the FEMU test group by its graph-path prefix. At the
reviewed revision, [the registration function](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/tests/qtest/femu-test.c#L18755)
makes 397 `qos_add_test()` calls. The areas include:

| Area | Registered examples |
| --- | --- |
| Queues and completion | Doorbell and shadow-doorbell I/O, queue mapping, completion-queue churn, deleting an in-flight submission queue |
| Transfer addressing | Noncontiguous queues, controller memory buffer, SGL, 4 KiB and 8 KiB logical blocks |
| Namespace and command-set behavior | KV discovery, accounting and namespace isolation; OpenChannel vector I/O; Identify with another command-set identifier |
| Zoned behavior | Append limits, format index, parallel append, zone reset |
| FDP and observability | Events, reclaim-unit-handle updates including full units, log pages, media counters, buffer counters |
| CXL SSD | Topology, cache and prefetch, DER modes, the caching API, the NVMe front end on a CXL SSD |
| Mapping and placement | Hybrid-mapping oracle and occupancy cases, Streams resources, placement and GC |
| Namespace management and logs | Namespace create, attach and capacity checks, persistent event log, telemetry, log lengths |

List the selected cases in a configured build before reporting their results:

```bash
# From build-femu/, with the QEMU binary and qtest executable built:
QTEST_QEMU_BINARY=./qemu-system-x86_64 ./tests/qtest/qos-test -l \
  -p /x86_64/pc/i440FX-pcihost/pci-bus-pc/pci-bus/femu/femu-tests
```

Keep the listing and execution logs together. Compare selected cases with
passed, failed, and skipped cases; a narrower path can select only one case.
The source registration count above is not a measured run of these cases
on the review host, and these qtests do not replace guest workloads.

## Implementation sources

Reviewed against FEMU [`39a55eeb6`](https://github.com/MoatLab/FEMU/tree/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be). The examples describe this revision; see [validation coverage](/docs/implementation#validation-coverage).

- [femu.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/femu.c): properties, initialization, validation, and namespace dispatch
- [bbssd/ftl.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl.c): FTL initialization and request handling
- [tests/unit/test-nand-media.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/tests/unit/test-nand-media.c): standalone media behavior tests
