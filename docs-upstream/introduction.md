---
title: "Introduction"
description: "FEMU is an SSD emulator built into QEMU."
mdx:
  format: md
custom_edit_url: https://github.com/MoatLab/FEMU/issues/new?title=Manual%20introduction%3A%20
---

:::info[From the FEMU Manual]

This page is chapter 1 of the [FEMU Manual (PDF)](pathname:///pdf/femu-manual.pdf), revision `7a505aa02`. Report corrections in the [FEMU issue tracker](https://github.com/MoatLab/FEMU/issues/new?title=Manual%20introduction%3A%20).

:::

> **Abstract.** FEMU is an NVMe and CXL SSD emulator built on QEMU/KVM. A guest operating system sees an emulated SSD as a real PCIe device and drives it with its own NVMe or CXL drivers, while FEMU charges NAND, channel and garbage collection time from a configurable timing model. FEMU emulates several kinds of SSD: a fast DRAM-backed NVMe device with no media timing, a conventional SSD with a device FTL, Zoned Namespace, Open-Channel, key-value and computational storage SSDs, and a CXL Type-3 memory device backed by flash.
>
> This manual describes how to build and run FEMU, how it is built inside, each mode and feature with its parameters, the counters it reports and how to measure with them, and how to test and change it. The chapters are generated from the Markdown documentation in the FEMU repository, which remains the reference when the two differ.
>
> **Keywords:** SSD emulation, NVMe, flash translation layer, zoned storage, CXL, QEMU

FEMU is an SSD emulator built into QEMU. It adds three devices to QEMU: `femu`, an NVMe controller; `femu-subsys`, an NVMe subsystem that groups controllers and namespaces; and `femu-cxl-ssd`, a CXL Type-3 memory device. A guest operating system finds the controllers and the CXL device on its PCIe bus and drives them with its own NVMe and CXL drivers; the subsystem is visible only through the controllers it groups. In the block modes, applications, file systems and the block layer in the guest run unchanged, so a whole storage stack can be studied on an SSD whose internals you choose (figure: [Where FEMU sits](index.md)).

This manual is modelled on the DiskSim reference manual: it explains how to run FEMU, then describes each component with its parameters, the statistics it produces and how far it has been validated, and closes with how to extend it. Its chapters are generated from the Markdown pages under `hw/femu/docs/` in the FEMU repository. Those pages are the reference; when this manual and the repository differ, the repository is right.

## What FEMU does

- **Emulates several kinds of SSD.** The `femu_mode` property of `-device femu` selects one: 0 Open-Channel SSD (OCSSD), 1 BlackBox SSD with a device FTL (BBSSD), 2 NoSSD, a DRAM device with no media timing and the default, 3 Zoned Namespace (ZNS), 4 computational storage (CSD), and 5 key-value (KV). Flexible Data Placement, several namespaces per controller, namespace management, and per-block metadata with protection information are features layered on these modes. `femu-cxl-ssd` puts a DRAM page cache in front of the BBSSD FTL and exposes the result as CXL memory.
- **Charges flash time.** The modes with flash compute how long each command would take on the emulated device: NAND reads, programs and erases, channel transfers, garbage collection, and optional host-link and controller-firmware costs. For NVMe commands the data itself is copied at once; FEMU holds the completion until the host clock reaches the computed time, so the guest sees the modelled latency on its own clock. On the CXL SSD, the vCPU that made an access waits out the media time before the access completes.
- **Reports what the device did.** For BBSSD, CSD and KV, a vendor log page (C0h) gives the write amplification factor and media counters. The SMART log gives host read and write totals, wear and media errors, and the CXL SSD exposes cache counters as QOM properties readable over QMP.
- **Is configured from the command line.** Every geometry, timing and FTL parameter is a device property, documented in [Property reference](reference/properties.md). Launcher scripts in `hw/femu/scripts/` start a guest with a working configuration for most modes; KV mode has none.

## What FEMU does not do

- **It does not keep data across runs.** The emulated medium lives in host memory. A guest reboot or a controller reset keeps it (unless you trigger a simulated power loss on a device with `power_loss=on`, which drops the write buffer); QEMU exiting loses it. FEMU never writes an NVMe namespace to a file. A `femu-cxl-ssd` given a file-backed memory backend leaves its bytes in that file.
- **It does not support migration or snapshots.** The devices are marked unmigratable, so QEMU refuses `migrate` and `savevm`.
- **It does not slow the host down to the model.** Latencies are lower bounds: a completion is posted on the first poller sweep after it is due, so a poller thread that does not get a host CPU adds delay on top. [Measuring and validation](guides/measuring.md) explains how to get repeatable numbers.
- **It does not reproduce a particular commercial SSD.** Its timing comes from the parameters you set. Calibrating them against a real drive is your part of the experiment.
- **It does not run everywhere.** FEMU needs an x86_64 Linux host with hardware virtualization and KVM. Open-Channel mode needs a guest kernel from 4.16 to 5.14 (4.17 for Open-Channel 2.0, the default), because Linux removed LightNVM in 5.15.

## Organization of this manual

- **[Getting started](getting-started/requirements.md)**: Host requirements, building FEMU, preparing a guest image, and a first run that measures write amplification.
- **[Architecture and design](concepts/architecture.md)**: The layers of FEMU from the guest interface to the memory backend, its threads, and the design of the NVMe front end, the FTL and the NAND timing model.
- **[Modes and features](concepts/choosing-a-mode.md)**: How to choose a mode, then one part per mode or feature: what it emulates, how to turn it on, its parameters and its limits.
- **[Running and configuring](reference/parameter-manual.md)**: The parameter manual, tutorials, performance tuning, and the security model and host sizing.
- **[Measuring and validation](guides/measuring.md)**: The counters FEMU reports, recipes for repeatable measurements, and the timing model in detail.
- **[Troubleshooting](troubleshooting.md)**: Answers to common questions and how to debug FEMU.
- **[Contributing](development/code-structure.md)**: The source tree, the tests, and the checks that keep this documentation in step with the code.
- **Appendices**: The device property reference generated from the binary, log pages and counters, the scripts shipped with FEMU, and the changelog.

## Conventions

Commands, file names, properties and values are set in `monospace`. A reference such as (§4.2) points to another part of this manual. A footnote gives the GitHub address of a file in the FEMU repository that the manual does not include, or of an outside page. Command blocks are taken from the Markdown pages, where continuous integration runs most `-device femu` examples to check that they still work. Diagrams drawn in text keep their original layout and may be set in smaller type to fit the page.

## How to cite FEMU

If you use FEMU in your research, cite the FAST '18 paper. The same reference is in `CITATION.cff` at the top of the repository.

```bibtex
@inproceedings{Li+18-FEMU,
  author    = {Huaicheng Li and Mingzhe Hao and Michael Hao Tong and
               Swaminathan Sundararaman and Matias Bj{\o}rling and Haryadi S. Gunawi},
  title     = {{The CASE of FEMU: Cheap, Accurate, Scalable and Extensible Flash Emulator}},
  booktitle = {16th USENIX Conference on File and Storage Technologies (FAST 18)},
  year      = {2018},
}
```

If you use one of the following modes, also cite the paper it comes from: FDP comes from WARP (FAST '26, [Citation](features/fdp.md#citation)), the CXL SSD from Cylon (FAST '26, [Citation](modes/cxl-ssd.md#citation)) and CSD from CEMU (ASPLOS '26, [Citation](modes/csd.md#citation)).

## Acknowledgement

FEMU is supported by the U.S. National Science Foundation through NSF POSE award #2550145, *Toward a Community-Driven Fast Emulator (FEMU) Ecosystem for Next-Generation Storage Systems Research and Innovation*. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the National Science Foundation.
