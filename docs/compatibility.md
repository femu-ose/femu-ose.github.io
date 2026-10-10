---
title: Compatibility
description: "Which hosts, guest kernels and FEMU versions work together, how each combination was checked, and how to report one that is not listed."
---

# Compatibility

This page says which combinations of host, guest and FEMU version work, and how
each one was checked. The full details, with the commands to check your own
machine, are in the manual's
[requirements](/manual/getting-started/requirements).

## Support labels

| Label | Meaning |
| --- | --- |
| Built in CI | Every change is built and tested on this host, without booting a guest |
| Run end to end | The quick start was run on this host with a guest, at the commit the manual documents |
| Expected to work | Meets the requirements, but nobody tests it regularly |
| Not supported | Known not to work, or works with distorted timing |

## Host

FEMU needs an x86_64 Linux host with KVM. It is based on QEMU 10.1, which needs
Python 3.9 or newer and GLib 2.66 or newer.

| Host | Status |
| --- | --- |
| Ubuntu 24.04 LTS | Built in CI |
| Ubuntu 22.04 LTS | Built in CI |
| Pop!_OS 24.04 (Ubuntu 24.04 base), Linux 6.18 | Run end to end |
| Other distributions with Python 3.9+ and GLib 2.66+ | Expected to work |
| Ubuntu 20.04 and older | Not supported: cannot build with stock packages |
| Nested virtualization | Not supported: it works but distorts the emulated latency |
| WSL | Not supported |

## Guest kernel

The guest image from `make-guest-image.sh` runs Ubuntu 24.04 with Linux 6.8. It
covers every mode except Open-Channel, which needs Linux 4.16 to 5.14. Zoned
namespaces need Linux 5.9 or newer, and key-value needs 6.0 or newer. The
[kernel per mode](/manual/getting-started/requirements#kernel-per-mode) table
lists each mode.

## FEMU version

The manual documents FEMU `master`. The latest tagged release is `femu-v9.0.1`
(June 2024). Use `master` unless you must match the version a paper used; the
[reproducibility](/docs/research/reproducibility) page explains how to pin a
commit.

## Report a combination

If you ran FEMU on a host or guest that is not listed, tell us whether it
worked. Open an [issue](https://github.com/MoatLab/FEMU/issues) with:

- the host distribution and kernel;
- the FEMU commit;
- the mode and the guest kernel;
- the command you ran and what happened.

A report that a combination works is as useful as a report that it fails.
