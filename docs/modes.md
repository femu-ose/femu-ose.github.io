---
title: Mode notes
sidebar_position: 1
slug: /modes
description: "Compare FEMU device interfaces and choose a mode for block I/O, zones, placement hints, key-value commands, or computational storage."
---

# Mode notes

:::tip[Design note]

To choose a mode, start with [Choosing a mode](/manual/concepts/choosing-a-mode) in the FEMU Manual. The pages in this section are design notes traced through the source.

:::

Choose the interface your experiment needs, then the policies implemented on
that path. There are six numeric controller modes. FDP is a placement extension
to black-box mode; OpenChannel is included for historical workloads. The CXL SSD
is a separate device type, `femu-cxl-ssd`, not a `femu_mode`. The manual's
[mode table](/manual/concepts/choosing-a-mode#every-mode-at-a-glance) is
generated from the source and lists every mode and feature, including
namespace management, metadata and protection information, and the CXL SSD
with its NVMe front end. The table below covers the modes these design notes
trace.

| Interface | `femu_mode` | Placement owner | Main experiment path |
| --- | --- | --- | --- |
| [Black-box](/docs/modes/blackbox) | 1 | Device FTL | Block workloads, mapping, GC, caches, NAND timing |
| [Zoned](/docs/modes/zns) | 3 | Host zone management | Sequential zones, append, reset, resource limits, ZRWA |
| [FDP](/docs/modes/fdp) | 1 + subsystem FDP | Host hints and device placement | Reclaim-unit handles and FDP collection strategies |
| [Key-value](/docs/modes/kv) | 5 | KV index and value store | Key commands, value programming, compaction |
| [Computational storage](/docs/modes/csd) | 4 | Block FTL plus compute commands | Device memory, program execution, compute-unit timing |
| [No SSD](/docs/modes/nossd) | 2 | No flash placement | NVMe software path and optional controller costs |
| [OpenChannel](/docs/modes/ocssd) | 0 | Compatible host placement stack | Historical physical I/O and chunk management |
| [CXL SSD](/manual/modes/cxl-ssd) (manual) | `-device femu-cxl-ssd` | Device cache and FTL behind CXL memory | Load and store access with SSD timing on cache misses |

## Choosing a starting point

For a filesystem or database with an ordinary NVMe block interface, start with
black-box. For host placement, choose ZNS when the application manages zone
lifetimes, or FDP when it sends placement directives while using a block
namespace. KV and CSD require their command-specific clients and probes.
NoSSD helps measure the software path without NAND timing.

The [implementation guide](/docs/implementation) maps features to their actual
paths. The [recipe catalog](/docs/configuration-recipes) supplies complete
configurations and verification steps. Check [model scope](/docs/modes/fidelity)
before treating a configuration as a calibrated device.

## Mixed namespaces

A controller can expose supported modes on different namespaces. For example:

```ini
[device]
mode = bbssd
devsz_mb = 6144
namespaces = 3
namespace_modes = bbssd,znssd,nossd
namespace_sizes = 2G,2G,2G
```

Each namespace has its own backing slice and mode state, but queues, controller
threads, and optional link/firmware resources remain shared. FDP and OpenChannel
are single-namespace configurations, and a controller takes at most one CSD
namespace. The manual's [several namespaces](/manual/features/multi-namespace)
page has the size rounding and refusal rules. The INI helper handles QEMU comma escaping;
see the [complete mixed recipe](/configs/mixed.conf).

## Implementation sources

Reviewed against FEMU [`39a55eeb6`](https://github.com/MoatLab/FEMU/tree/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be). The examples describe this revision; see [validation coverage](/docs/implementation#validation-coverage).

- [femu.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/femu.c): mode dispatch, namespace restrictions, properties
- [nvme.h](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/nvme.h): numeric mode definitions
