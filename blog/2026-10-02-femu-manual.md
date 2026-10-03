---
title: The FEMU Manual is now on the website
description: Fifty-eight documentation pages and nine guest-tested tutorials, mirrored from the FEMU repository at a pinned commit.
slug: femu-manual
authors: [huaicheng]
tags: [docs]
---

The [FEMU Manual](/manual) is now part of this site. It is FEMU's in-tree
documentation, `hw/femu/docs`, mirrored at a pinned commit so every page says
exactly which FEMU it describes.

{/* truncate */}

What you will find there:

- **Getting started** that was run end to end: requirements, the build, a
  guest image script, and a quick start.
- **Nine tutorials**, each printing the output you should see: your first
  SSD, garbage collection and WAF, zoned namespaces, Flexible Data Placement,
  latency tuning, several namespaces, key-value, a CXL SSD as memory, and
  configuration files.
- **A guide per mode**, including the CXL SSD, and feature guides for FDP,
  multiple namespaces, namespace management with protection information, and
  the CXL caching API.
- **Reference pages generated from the binary**: every device property, the
  runtime properties, log pages and counters, and the scripts.
- **The design chapters and the changelog**, and the whole manual as a
  [PDF](pathname:///pdf/femu-manual.pdf).

The manual is maintained in the FEMU repository, where every example is
checked in CI. To correct a page, use its "Edit this page" link, which opens
the file upstream. The website's own pages are now
[design notes](/docs/implementation), [experiment tools](/docs/configuration-recipes),
[research](/docs/research/cite) and [community](/docs/community) material that
build on the manual.
