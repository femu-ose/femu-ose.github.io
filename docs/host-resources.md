---
title: Plan host resources
description: "Check x86-64 Linux and KVM prerequisites, plan guest and device memory, and record host resource usage for FEMU experiments."
---

# Plan host resources

Start with one device and a small functional workload. Establish correct
enumeration and data readback before increasing capacity, controller count,
or workload concurrency. The [baseline recipe](/docs/configuration-recipes)
is a functional starting point, not a minimum-memory configuration.

## Check host compatibility first

The documented launch uses `qemu-system-x86_64`, `-enable-kvm`, and `-cpu host`
with an x86-64 guest image. Use an **x86-64 Linux host with working KVM** for this
path. Run these commands on the machine that will execute FEMU:

```bash
uname -s
uname -m
ls -l /dev/kvm
test -r /dev/kvm && test -w /dev/kvm
echo $?
```

Expect `Linux`, `x86_64`, a KVM device listing, and exit status `0`.
Device permissions are a prerequisite; successful QEMU
startup must still establish that KVM initializes. An Arm Linux host can have
`/dev/kvm` without supporting this x86-64 KVM launch. Changing the accelerator
or guest architecture requires a separate launch configuration and validation.

On macOS, start with [the standalone model test](/docs/community/first-test),
or use a suitable remote Linux host for the full guest workflow. Installing
Linux in an Arm VM does not satisfy the x86-64 host requirement.

The [build configuration](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/meson.build#L286-L305)
selects KVM targets by host architecture. QEMU's
[accelerator overview](https://www.qemu.org/docs/master/system/introduction.html#virtualisation-accelerators)
explains the broader host and accelerator choices.

## What consumes memory

Plan for guest RAM, device payload backing, device metadata, QEMU, and the host's
other work. Do not treat the exposed namespace size as the whole requirement.
The manual's [requirements page](/manual/getting-started/requirements#memory)
gives per-launcher totals; this page explains where the memory goes.

| Allocation | What determines its size |
| --- | --- |
| Guest RAM | QEMU's `-m` argument |
| Controller payload backing | Normally `devsz_mb` MiB; black-box `op_pcent` instead allocates the full raw NAND capacity |
| Black-box mapping and reverse map | Both allocate an entry for every raw physical page |
| NAND state | Channel, LUN, plane, block, and page counts from raw geometry |
| Optional policy state | Translation-cache entries, read-cache membership, buffered-page records, and mapping-policy structures |

The baseline exposes 4 GiB over 16 GiB raw NAND with 4 KiB pages. It therefore
allocates a 4 GiB payload buffer and metadata for 4,194,304 raw pages, in addition
to guest RAM and other state. The over-provisioned recipe has 4 GiB raw NAND
and `op_pcent=10`: its payload allocation is still 4 GiB although it exposes
less capacity. These are allocation sizes, not measured peak resident memory.

Reducing `devsz_mb` alone does not shrink the raw-geometry mapping tables.
Reducing geometry can lower metadata costs, but also changes device parallelism,
GC workspace, and the experiment. Recheck capacity and reserve with the
[geometry calculator](/docs/geometry). DFTL retains the full mapping table;
its translation-cache setting does not cap FEMU's host-memory usage.

## Check the running host

On the Linux host, record memory availability before launch and process usage
after device startup and workload preparation:

```bash
free -h
ulimit -l
# Set this to the PID of your FEMU QEMU process.
FEMU_PID=12345
ps -p "$FEMU_PID" -o pid,etime,rss,vsz,pcpu,args
vmstat 1
```

RSS and VSZ from this `ps` command are in KiB. VSZ is address space, not resident
RAM. Save observations during the workload as well as at startup; a quiet
process does not establish the working-set cost of a prepared experiment.

The backend attempts to lock its payload buffer into RAM. If `mlock` fails,
FEMU logs `cannot pin` and continues; page faults can then affect latency.
Record this warning and memory pressure when comparing runs. Swapping or host
CPU contention can obscure the modeled timing differences.

## Scale controllers deliberately

Each controller allocates its own payload backend and execution resources,
except that controllers sharing namespaces through a `femu-subsys` with
`ns_mgmt` use the subsystem's one backend. Multiple namespaces share a
controller backend and controller resources; they are not equivalent to
independent SSD controllers. See the
[architecture guide](/docs/architecture#namespace-isolation-and-shared-resources).

For RAID or another multi-device guest workload, first verify each controller
and its namespace independently. Increase controller count with per-device
geometry fixed, recording host memory and CPU use at each step. If you also
shrink devices to fit the host, report that as a different configuration.

### Worked budget: one VM, several controllers

Assume one VM with **4 GiB guest RAM** (`-m 4G`) and one black-box namespace
per controller. Give each controller the unchanged
[baseline geometry](/docs/configuration-recipes#baseline-geometry-and-space):
`devsz_mb=4096`, 16 GiB raw NAND, and 4 KiB pages. Explicit `op_pcent` is off
in this example.

Each controller adds a 4 GiB payload allocation and metadata for 4,194,304 raw
pages. Guest RAM is counted once because these controllers belong to one VM.

<div className="compact-table">

| Count | Payload (GiB) | Guest + payload (GiB) |
| ---: | ---: | ---: |
| 1 | 4 | 8 |
| 2 | 8 | 12 |
| 4 | 16 | 20 |
| 8 | 32 | 36 |

</div>

The subtotal is `4 GiB + controller_count × 4 GiB`. Add mapping tables, NAND
state, optional policy state, QEMU overhead, and the host's other work before
choosing a machine. For example, four controllers already account for 20 GiB
of guest RAM and payload backing before those additional allocations. This
four-controller model also tracks 16,777,216 raw pages for its metadata. The
table is allocation arithmetic, not peak RSS or a tested host-memory limit.

If you run one VM per controller with 4 GiB guest RAM each, the guest-plus-payload
subtotal instead becomes `controller_count × 8 GiB`. If you enable `op_pcent`
while retaining the 16 GiB raw geometry, payload backing becomes 16 GiB per
controller. Recalculate after either change. Dividing one controller into more
namespaces does not reproduce this independent-controller topology.

## Implementation sources

Reviewed at FEMU `39a55eeb6`; host sizing was source-traced, not measured by
a Linux/KVM scaling benchmark in this documentation review.

- [femu.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/femu.c): backend size selection and controller initialization
- [backend/dram.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/backend/dram.c): allocation, memory locking, and warnings
- [bbssd/ftl-map.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl-map.c): full mapping and reverse-map allocation
- [bbssd/ftl-geom.c](https://github.com/MoatLab/FEMU/blob/39a55eeb637b23c26b3a2ce9254399c9e0b1b3be/hw/femu/bbssd/ftl-geom.c): raw geometry and NAND-state allocation
