---
title: "Code structure"
description: "All FEMU code, scripts, tests and documentation live under hw/femu/, so the rest of the tree stays QEMU. A top-level femu-scripts link points to..."
mdx:
  format: md
custom_edit_url: https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/docs/development/code-structure.md
---

:::info[Mirrored from the FEMU repository]

This page is [`hw/femu/docs/development/code-structure.md`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/docs/development/code-structure.md) at FEMU `00b40928c` (2026-10-04), licensed GPL-2.0-or-later. Send corrections to the FEMU repository.

:::


All FEMU code, scripts, tests and documentation live under `hw/femu/`, so
the rest of the tree stays QEMU. A top-level `femu-scripts` link points to
`hw/femu/scripts/`, which keeps the `cd build-femu && ../femu-scripts/...`
workflow working. How the pieces fit together at run time, layer by layer,
is in [architecture](../concepts/architecture.md).

## Directory map

![The FEMU source tree under hw/femu/: the NVMe controller files at the top level, one directory per mode, the shared media and library code, and the scripts, tests, tools and docs around them.](/img/manual/dev-repo.svg)

*Figure: The FEMU source tree under `hw/femu/`: the NVMe controller files at the top level, one directory per mode, the shared media and library code, and the scripts, tests, tools and docs around them.*

| Path | What is there |
| --- | --- |
| [`femu.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/femu.c) | QOM types `femu` and `femu-subsys`, property definitions, realize and exit, the FTL thread, mode registration |
| [`femu-props.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/femu-props.c) | Help text for every `femu` and `femu-subsys` property (what `-device femu,help` prints) |
| [`nvme.h`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme.h) | NVMe structures, the `femu_mode` enum and the controller state `FemuCtrl` |
| [`nvme-admin.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-admin.c) | Admin commands, starting the pollers, namespace management, asynchronous events |
| [`nvme-caps.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-caps.c) | What the controller advertises: the Commands Supported and Effects and Supported Log Pages entries, and the Identify bits derived from them |
| [`nvme-io.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-io.c) | I/O commands and the poller loop that fetches submissions and posts completions |
| [`nvme-util.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-util.c) | Deallocation state per LBA (TRIM, Write Zeroes with deallocate, DULBE), queue head and tail and completion posting helpers, poller pause and resume, the Timestamp feature |
| [`nvme-pel.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-pel.c) | Persistent Event log and its `pel_file` |
| [`nvme-pi.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-pi.c) | Metadata and protection information |
| [`nvme-streams.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nvme-streams.c) | Streams directive |
| [`dma.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/dma.c) | PRP and SGL mapping, copies between guest memory and the device |
| [`intr.c`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/intr.c) | MSI-X, MSI and pin interrupts |
| [`bbssd/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/bbssd) | BlackBox mode (`bb.c`) and its FTL: geometry, data path, mapping schemes, read cache, GC and lines, FDP, the bridge to the NAND media layer |
| [`zns/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/zns) | ZNS mode (`zns.c`) and its zone FTL (`zftl.c`) |
| [`ocssd/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/ocssd) | Open-Channel 1.2 (`oc12.c`) and 2.0 (`oc20.c`); their `flash_type` times, geometry check and vendor command 0xEE (`oc-timing.c`) |
| [`nossd/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nossd) | NoSSD mode (`nop.c`) |
| [`kvssd/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/kvssd) | Key-value mode: commands, its FTL, Identify and features |
| [`csd/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/csd) | Computational storage mode and its private commands |
| [`cxlssd/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/cxlssd) | `femu-cxl-ssd`: QOM glue, the page cache, the DER modes, the caching API |
| [`nand/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/nand) | NAND media layer: per-cell-type timing tables and the timing of each operation |
| [`backend/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/backend) | The DRAM backend that holds the emulated medium |
| [`lib/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/lib), [`inc/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/inc) | Lock-free rings and the priority queue, and their headers |
| [`scripts/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/scripts) | Build and launch scripts, configs, guest tools, documentation tooling ([scripts reference](../reference/scripts.md)) |
| [`tools/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/tools) | Guest tools for the CXL caching API |
| [`tests/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/tests) | Unit tests, the qtest file, CSD guest tests ([testing](../guides/testing.md)) |
| [`docs/`](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/hw/femu/docs) | This documentation ([doc map](../index.md)) |

## Making a change

![Contributing a change: one logical change with a failing test and its docs, checked locally with checkpatch, make check and make check-docs, then the four CI jobs run on the pull request.](/img/manual/dev-workflow.svg)

*Figure: Contributing a change: one logical change with a failing test and its docs, checked locally with checkpatch, `make check` and `make check-docs`, then the four CI jobs run on the pull request.*

[CONTRIBUTING.md](https://github.com/MoatLab/FEMU/blob/00b40928c51e649e93a089e7b78a1bb2ff19c779/CONTRIBUTING.md) has the process: style
(`checkpatch.pl`), tests, sign-off and pull requests. For a new property,
add its help text in `femu-props.c` and regenerate the property reference
([keeping the documentation correct](docs-maintenance.md)). For a new mode,
add it to the `femu_mode` enum in `nvme.h`, register its handlers the way
the existing modes do in `femu.c`, and add an entry to `docs/modes.py`.
