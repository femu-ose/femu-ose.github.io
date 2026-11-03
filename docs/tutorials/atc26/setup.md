---
title: "Prepare the tutorial environment"
description: "Prepare isolated Linux/KVM guests, explicit device identities, frozen source and experiment receipts before the session."
---

# Prepare the tutorial environment

## Choose an environment

Use a prepared Linux/KVM host with the tutorial image, or an instructor-assigned
host over SSH. macOS is suitable for source study and standalone model tests;
it does not qualify the KVM guest labs. Hosted capacity must be checked before
assigning seats. Do not assume public remote machines are provided.

The placement lab uses a 12 GiB emulated namespace plus 4 GiB guest RAM and
additional emulator/FTL overhead. Reserve at least 20 GiB available host RAM
per active placement VM, then measure actual usage and concurrency. Allow disk
space for the base image, independent overlays, build and receipts.

## Freeze the inputs

```bash
# Host: a new public-source checkout, separate from research branches.
git clone https://github.com/MoatLab/FEMU.git
cd FEMU
git checkout 1918eb9795baa4483e7721429db5e58c54305878
mkdir build && cd build
../configure --target-list=x86_64-softmmu --enable-kvm --disable-werror
ninja -j4 qemu-system-x86_64
```

Prepare the guest before attending using the
[canonical guest-image guide](/manual/getting-started/guest-image).
The CXL exercise requires its own prepared kernel and CXL/DAX tools.
The pack's `labs/bin/build-cxl-kernel.sh NEW_DIRECTORY` builds an isolated
upstream v6.12 kernel with the required options. Prepare an initrd appropriate
to your guest root filesystem, and verify region creation before teaching.
A kernel build alone does not qualify the image.
CSD requires the matching guest tool and trusted host library from
`hw/femu/tests/csd`. Build `csd-passthru` and `csd-vadd.so`; install the tool
as `/usr/local/bin/csd-passthru` in the guest and set `CSD_PROGRAM_DIR` on the host.
Never download packages or compile a kernel during a 30-minute session.

## Start a disposable VM

Extract the learner pack. Set `FEMU_BUILD` to the directory containing the
built binary and `BASE_IMAGE` to your prepared qcow2 image.

```bash
# Host: run from the extracted pack directory.
export RUN_DIR=$(mktemp -d /tmp/atc26-run.XXXXXXXX)
qemu-img create -f qcow2 -F qcow2 -b "$BASE_IMAGE" "$RUN_DIR/guest.qcow2"
export OSIMGF="$RUN_DIR/guest.qcow2"
export SSH_PORT=18080
bash labs/bin/femu-lab.sh nossd
```

In a second host terminal, set `RUN_DIR` to the printed run directory:

```bash
set -a
. "$RUN_DIR/connection.env"
set +a
bash labs/bin/preflight.sh -o "$RUN_DIR/results" labs/guest/lab-s0.sh /dev/nvme0n1
```

Inspect `nvme list` in the guest and substitute its actual namespace.
The scripts require the recorded serial and byte capacity and reject mounted,
partitioned, swap or held devices. Device numbering alone never authorizes I/O.
The example guest login is `femu`; set `GUEST_USER` and `GUEST_PASS` for your
prepared image, or `SSH_KEY` for key authentication. Prepare passwordless sudo inside this
disposable guest for the lab account. Do not publish credentials.

## Reset and preserve evidence

```bash
# Host: stop only the VM addressed by this run's QMP socket.
python3 labs/bin/stop-vm.py "$RUN_DIR/qmp.sock"
```

Keep the receipt and start a new overlay/run directory for the next arm.
Restarting QEMU clears the emulated media, FTL, GC, zones and counters.
An OS-disk overlay alone does not reset a still-running emulated SSD.
A guest reboot alone does not establish the same initial state.

Before class, run the actual module on the actual image. A build or source
review alone is not a successful guest qualification.
