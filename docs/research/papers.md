---
title: Research using FEMU
description: "Explore reviewed research uses of FEMU, with links to papers and explanations of how their implementations or evaluations use the emulator."
---

# Research using FEMU

This page has two tiers. The first is a reviewed selection: for each paper,
the relationship column says how FEMU supported its implementation or
evaluation and points to the relevant part of the paper. The second is the
full list from the FEMU wiki, grouped by year, whose entries have not been
reviewed for how they use FEMU.

For the long tail, Google Scholar lists the
[papers that cite the FAST '18 paper](https://scholar.google.com/scholar?cites=16485597046278505365)
(281 on October 2, 2026). A citation alone does not mean a paper used FEMU.

## Reviewed implementations and evaluations

Reviewed September 20, 2026.

| Paper | Venue | Relationship to FEMU |
| --- | --- | --- |
| [ZNS+: Advanced Zoned Namespace Interface for Supporting In-Storage Zone Compaction](https://www.usenix.org/conference/osdi21/presentation/han) | OSDI 2021 | Implements ZNS+ in FEMU and on OpenSSD; evaluation describes the emulated geometry and host stack |
| [IODA: A Host/Device Co-Design for Strong Predictability Contract on Modern Flash Storage](https://doi.org/10.1145/3477132.3483573) | SOSP 2021 | Prototypes firmware logic in an extended FEMU and on OpenChannel SSD hardware; see implementation and evaluation |
| [The Design and Implementation of a Capacity-Variant Storage System](https://www.usenix.org/conference/fast24/presentation/jiao) | FAST 2024 | Builds the capacity-variant SSD on FEMU and adds an error model; see implementation and artifact instructions |
| [Improving the Reliability of Next Generation SSDs using WOM-v Codes](https://www.usenix.org/conference/fast22/presentation/jaffer) | FAST 2022 | Combines LightNVM changes with QLC support in FEMU for a WOM-v testbed; see the implementation description |
| [Remap-SSD: Safely and Efficiently Exploiting SSD Address Remapping to Eliminate Duplicate Writes](https://www.usenix.org/conference/fast21/presentation/wu-qiulin) | FAST 2021 | Uses FEMU for most experiments, with additional SSDsim experiments; see experimental setup |
| [Determinizing Crash Behavior with a Verified Snapshot-Consistent Flash Translation Layer](https://www.usenix.org/conference/osdi20/presentation/chang) | OSDI 2020 | Runs the verified FTL over a FEMU-emulated OpenChannel SSD and adapts latency handling for its command path; see evaluation |
| [LearnedFTL: A Learning-Based Page-Level FTL for Reducing Double Reads in Flash-Based SSDs](https://doi.org/10.1109/HPCA57654.2024.00054) | HPCA 2024 | Evaluates a FEMU-based prototype with explicit capacity, geometry, and timing settings; see experiment setup |
| [ScalaAFA: Constructing User-Space All-Flash Array Engine with Holistic Designs](https://www.usenix.org/conference/atc24/presentation/yi-shushu) | ATC 2024 | Evaluates array designs with multiple FEMU-emulated SSDs and modeled controller extensions; see §6.1 |
| [ScalaCache: Scalable User-Space Page Cache Management with Software-Hardware Coordination](https://www.usenix.org/conference/atc24/presentation/peng) | ATC 2024 | Customizes FEMU to emulate multicore computational-storage devices and extends host-memory-buffer setup; see implementation |
| [SimBricks: End-to-End Network System Evaluation with Modular Simulation](https://doi.org/10.1145/3544216.3544253) | SIGCOMM 2022 | Adapts FEMU's NVMe model into a separate simulator connected through SimBricks's PCIe interface |

These systems may use research-specific forks, commands, or model changes.
Their results do not establish that those extensions are present in the
[current documented FEMU revision](/docs/implementation). Use each paper's
artifact and configuration when reproducing its experiments.

## Related emulators and comparisons

[NVMeVirt: A Versatile Software-defined Virtual NVMe Device](https://www.usenix.org/conference/fast23/presentation/kim-sang-hoon)
(FAST 2023) describes a page-mapped FTL based on FEMU's design and compares
emulation latency against FEMU in §4.2. It is a separate virtual-device system.
The comparison uses the versions and configurations stated in that paper.

## All papers on the FEMU wiki

The upstream README points to the wiki page
[Research Papers using FEMU](https://github.com/MoatLab/FEMU/wiki/Research-Papers-using-FEMU),
which authors and maintainers have added to since 2019. The 42 entries below
copy its titles, venues and years as of October 2, 2026, in the wiki's order
within each year. Each title links to the publisher's record (a DOI, a USENIX
presentation page, or the MSST 2024 proceedings), and that record confirmed
the venue and year of every entry on the same date. Where the wiki's title
differs from the publisher's, the entry says so. "Reviewed above" marks papers
in the first table.

### 2024

- [ScalaAFA: Constructing User-Space All-Flash Array Engine with Holistic Designs](https://www.usenix.org/conference/atc24/presentation/yi-shushu) (ATC '24). Reviewed above.
- [ScalaCache: Scalable User-Space Page Cache Management with Software-Hardware Coordination](https://www.usenix.org/conference/atc24/presentation/peng) (ATC '24). Reviewed above.
- [Eliminating Storage Management Overhead of Deduplication over SSD Arrays Through a Hardware/Software Co-Design](https://doi.org/10.1145/3620665.3640368) (ASPLOS '24).
- [The Design and Implementation of a Capacity-Variant Storage System](https://www.usenix.org/conference/fast24/presentation/jiao) (FAST '24). Reviewed above.
- [LearnedFTL: A Learning-based Page-level FTL for Reducing Double Reads in Flash-based SSDs](https://doi.org/10.1109/hpca57654.2024.00054) (HPCA '24). Reviewed above.
- [WA-Zone: Wear-Aware Zone Management Optimization for LSM-Tree on ZNS SSDs](https://doi.org/10.1145/3637488) (TACO '24).
- [ZoneTrace: A Zone Monitoring Tool for F2FS on ZNS SSDs](https://doi.org/10.1145/3656172) (TODAES '24). The publisher title is "ZoneTrace: Zone Monitoring Tool for F2FS on ZNS SSDs".
- [Ensuring Compaction and Zone Cleaning Efficiency through Same-Zone Compaction in ZNS Key-Value Store](https://msstconference.org/MSST-history/2024/Papers/msst24-9.2.pdf) (MSST '24).

### 2023

- [Holistic and Opportunistic Scheduling of Background I/Os in Flash-based SSDs](https://doi.org/10.1109/tc.2023.3288748) (TC '23).
- [NVMeVirt: A Versatile Software-defined Virtual NVMe Device](https://www.usenix.org/conference/fast23/presentation/kim-sang-hoon) (FAST '23). Compared above.
- [DECC: Differential ECC for Read Performance Optimization on High-Density NAND Flash Memory](https://doi.org/10.1145/3566097.3567853) (ASPDAC '23).
- [ConfZNS : A Novel Emulator for Exploring Design Space of ZNS](https://doi.org/10.1145/3579370.3594772) (SYSTOR '23). The publisher title ends "Design Space of ZNS SSDs".
- [Optimizing Data Migration for Garbage Collection in ZNS SSDs](https://doi.org/10.23919/date56975.2023.10137231) (DATE '23).
- [zCeph: Achieving High Performance On Storage System Using Small Zoned ZNS SSD](https://doi.org/10.1145/3555776.3577758) (SAC '23).
- [Design of a High-Performance, High-Endurance Key-Value SSD for Large-Key Workloads](https://doi.org/10.1109/lca.2023.3282276) (IEEE CAL '23).
- [CFIO: A conflict-free I/O mechanism to fully exploit internal parallelism for Open-Channel SSDs](https://doi.org/10.1016/j.sysarc.2022.102803) (JSA '23).
- [An Efficient F2FS GC Scheme for Improving I/O Latency of Foreground Application](https://doi.org/10.1109/icce56470.2023.10043469) (ICCE '23). The publisher title ends "Foreground Applications".

### 2022

- [SimBricks: End-to-End Network System Evaluation with Modular Simulation](https://doi.org/10.1145/3544216.3544253) (SIGCOMM '22). Reviewed above.
- [Meta-Block: Exploiting Cross-Layer and Direct Storage Access for Decentralized Blockchain Storage Systems](https://doi.org/10.1109/tc.2022.3226305) (TC '22).
- [Improving the Reliability of Next Generation SSDs using WOM-v Codes](https://www.usenix.org/conference/fast22/presentation/jaffer) (FAST '22). Reviewed above. Best Paper Award at FAST '22.
- [Generating Realistic Wear Distributions for SSDs](https://doi.org/10.1145/3538643.3539757) (HotStorage '22).
- [When F2FS Meets Address Remapping](https://doi.org/10.1145/3538643.3539755) (HotStorage '22).
- [TailCut: Improving Performance and Lifetime of SSDs Using Pattern-Aware State Encoding](https://doi.org/10.1145/3489517.3530471) (DAC '22).
- [Selective Power-Loss-Protection Method for Write Buffer in ZNS SSDs](https://doi.org/10.3390/electronics11071086) (Electronics '22).
- [CoDiscard: A Revenue Model based Cross-layer Cooperative Discarding Mechanism for Flash Memory Devices](https://doi.org/10.1016/j.sysarc.2022.102564) (JSA '22).
- [NASA: NVM-Assisted Secure Deletion for Flash Memory](https://doi.org/10.1109/tcad.2022.3197514) (TCAD '22).
- [Understanding and Exploiting the Full Potential of SSD Address Remapping](https://doi.org/10.1109/tcad.2022.3144617) (TCAD '22).

### 2021

- [Finding the Optimal Execution Scheme of External Mergesort on Solid State Drives](https://doi.org/10.1007/s11280-021-00872-9) (World Wide Web '21).
- [SW-WAL: Leveraging Address Remapping of SSDs to Achieve Single-Write Write-Ahead Logging](https://doi.org/10.23919/date51398.2021.9473923) (DATE '21).
- [IODA: A Host/Device Co-Design for Strong Predictability Contract on Modern Flash Storage](https://doi.org/10.1145/3477132.3483573) (SOSP '21). Reviewed above.
- [Lightweight Data Lifetime Classification using Migration Counts to Improve Performance and Lifetime of Flash-based SSDs](https://doi.org/10.1145/3476886.3477520) (APSys '21).
- [ZNS+: Advanced Zoned Namespace Interface for Supporting In-Storage Zone Compaction](https://www.usenix.org/conference/osdi21/presentation/han) (OSDI '21). Reviewed above.
- [Remap-SSD: Safely and Efficiently Exploiting SSD Address Remapping to Eliminate Duplicate Writes](https://www.usenix.org/conference/fast21/presentation/wu-qiulin) (FAST '21). Reviewed above.
- [Prolonging 3D NAND SSD Lifetime via Read Latency Relaxation](https://doi.org/10.1145/3445814.3446733) (ASPLOS '21).
- [QBLKe: Host-side flash translation layer management for Open-Channel SSDs](https://doi.org/10.1016/j.sysarc.2021.102233) (Journal of Systems Architecture '21).
- [Better Atomic Writes by Exposing the Flash Out-of-Band Area to File Systems](https://doi.org/10.1145/3461648.3463843) (LCTES '21).

### 2020

- [Determinizing Crash Behavior with a Verified Snapshot-Consistent Flash Translation Layer](https://www.usenix.org/conference/osdi20/presentation/chang) (OSDI '20). Reviewed above.
- [LeapIO: Efficient and Portable Virtual NVMe Storage on ARM SoCs](https://doi.org/10.1145/3373376.3378531) (ASPLOS '20).
- [DualFS: A Coordinative Flash File System with Flash Block Dual-mode Switching](https://doi.org/10.1109/iccd50377.2020.00028) (ICCD '20).
- [HMB-I/O: Fast Track for Handling Urgent I/Os inNonvolatile Memory Express Solid-State Drives](https://doi.org/10.3390/app10124341) (Appl. Sci. '20). The publisher title has a space in "in Nonvolatile".

### 2019

- [QBLK: Towards Fully Exploiting the Parallelism of Open-Channel SSDs](https://doi.org/10.23919/date.2019.8715049) (DATE '19).
- [An Efficient Design and Implementation of Deduplication on Open-Channel SSDs](https://doi.org/10.1109/hpcc/smartcity/dss.2019.00087) (HPCC '19).

The papers that added modes to FEMU itself, WARP for FDP, Cylon for the CXL
SSD and CEMU for computational storage, are listed on the
[cite page](/docs/research/cite).

## How to add your paper

Open an issue on the
[FEMU issue tracker](https://github.com/MoatLab/FEMU/issues/new?title=Publication%3A%20)
titled "Publication: " followed by the paper title. Give the venue, year,
publication link, and the section that establishes the paper's relationship
to FEMU, plus an artifact link when available. Say whether FEMU was used for
an implementation, an evaluation, model reuse, a comparison, or is only cited,
so the entry can go in the right tier. The same issue corrects an existing
entry.
