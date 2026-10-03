---
title: Troubleshoot setup
description: "Diagnose FEMU setup failures by checkpoint, from host and KVM prerequisites to device configuration, guest discovery, and workload results."
---

# Troubleshoot setup

Start at the last checkpoint that succeeded. Keep the complete launch command
and its terminal output. For a specific symptom, the FEMU Manual's
[troubleshooting FAQ](/manual/troubleshooting) answers common questions with
links to the issues they came from. Run host checks on the machine running QEMU and guest
checks inside the VM; their kernels, devices, and permissions are different.

## QEMU does not start

First check [host architecture and KVM access](/docs/host-resources#check-host-compatibility-first).
From the FEMU checkout root on the x86-64 Linux host, verify the binary and the KVM
device available to your current user:

```bash
test -x build-femu/qemu-system-x86_64
ls -l /dev/kvm
test -r /dev/kvm && test -w /dev/kvm
```

Inspect each exit status. A missing binary means the build checkpoint was not
reached. A missing or inaccessible KVM device needs host configuration before
the documented `-enable-kvm` launch can work. Do not infer guest compatibility
from a successful standalone NAND test.

For a property or geometry error, retain the exact QEMU message, source commit,
INI file, and expanded arguments. Compare them with the
[complete recipe](/docs/configuration-recipes) and
[compatibility rules](/docs/policies). Configuration expansion alone does not
validate device realization. If startup reports memory allocation or pinning
trouble, follow [host resource planning](/docs/host-resources).

A warning such as `femu: serial has no effect and is accepted only for
compatibility` does not stop QEMU. `serial`, `ms`, `ms_max`, `dlfeat`,
`tplpbsy`, `tplrbsy`, `trcbsy`, `nr_thread`, `time_slice` and
`context_switch_time` are accepted so old command lines still start, but
nothing reads them; remove them from the launch line. Identify Controller
reports a serial number FEMU generates, not the `serial` value.

## QEMU runs but the terminal stays blank

Confirm that the boot image path is correct and the image is bootable with the
launcher's machine, firmware, and virtio disk attachment. `-nographic` does not
configure the guest's console. Check the guest kernel command line and serial
login setup in [The guest image](/manual/getting-started/guest-image).

Kernel messages without a login prompt point to a different checkpoint from
no kernel output. Keep that distinction in a report. Do not troubleshoot FEMU
namespace commands until the guest has booted and you can run them.

## The guest boots but the expected device is missing

Inside the guest, collect:

```bash
uname -r
lsblk -o NAME,TYPE,SIZE,MODEL,MOUNTPOINTS
sudo nvme list
sudo dmesg | tail -n 100
```

If installed, `lspci -nnk` can distinguish PCI controller presence from driver
binding. Compare its controller and driver information with the boot log.
Verify that the running QEMU command includes the intended FEMU device and
namespace configuration. Another NVMe device may own `/dev/nvme0`.

Controller presence does not guarantee an ordinary block namespace. In
particular, use the [KV probe](/manual/modes/kvssd#with-kv-probe) for KV mode.
For block modes, check the selected controller with `nvme id-ctrl` and its
namespace with `nvme id-ns`, as shown in the [quick start](/manual/getting-started/quick-start).

## Commands work but the result differs

Keep command exit status, returned data, state transitions, and performance
measurements separate. An unsupported command or missing placement directive
needs interface investigation; unexpected timing needs configuration and
[counter interpretation](/docs/observability). For example, a GC-policy change
can have no effect when the workload never reaches collection.

Use the [recipe report outline](/docs/community/contributing#report-a-recipe-result)
to report the last successful checkpoint and the first failed command. Include
errors as text and remove private paths, credentials, and workload data before
sharing. These steps organize diagnosis; the full guest setup still requires
validation on your Linux/KVM host.
