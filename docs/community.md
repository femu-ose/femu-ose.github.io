---
title: Community
sidebar_position: 1
slug: /community
description: "Find FEMU support channels, contribution opportunities, a first model test, and teaching activities for storage researchers and developers."
---

# Community

## Where to ask what

| You want to | Go to |
| --- | --- |
| Ask how to do something | [GitHub Discussions](https://github.com/MoatLab/FEMU/discussions) or [Discord](https://discord.gg/AgPTUJCw7) |
| Discuss FEMU usage by email | The mailing list, [femu@googlegroups.com](https://groups.google.com/g/femu). Ask to join on the group page; an owner approves requests, and the archive is visible to members |
| Report something broken | [Issues](https://github.com/MoatLab/FEMU/issues) |
| Propose a change | [Pull requests](https://github.com/MoatLab/FEMU/pulls) |
| Report a potential vulnerability privately | [Report a vulnerability](https://github.com/MoatLab/FEMU/security/advisories/new) on GitHub, as the [security policy](https://github.com/MoatLab/FEMU/blob/master/SECURITY.md) describes; never in a public issue |

Before opening an issue, include the mode, source commit, full device arguments,
guest kernel and tools, the command that failed, and the expected and actual
results. Remove credentials and private workload data from attachments.

## Tell us you use FEMU

If FEMU is part of your research, course or product, post a short note in
[Show and tell](https://github.com/MoatLab/FEMU/discussions/categories/show-and-tell):
who you are, what you emulate, and what you wish FEMU did. It tells us which
modes and features matter, and it is the evidence an open-source project needs
to keep its funding. Papers also go on the [papers page](/docs/research/papers).

## Project policies

These files live in the repository and are the authority when this site and
they differ.

| File | What it covers |
| --- | --- |
| [CONTRIBUTING.md](https://github.com/MoatLab/FEMU/blob/master/CONTRIBUTING.md) | How to propose, test and submit a change |
| [CODE_OF_CONDUCT.md](https://github.com/MoatLab/FEMU/blob/master/CODE_OF_CONDUCT.md) | Expected behavior in every project space |
| [SECURITY.md](https://github.com/MoatLab/FEMU/blob/master/SECURITY.md) | Private reporting, response times and scope |
| [MAINTAINERS](https://github.com/MoatLab/FEMU/blob/master/MAINTAINERS) | Who reviews which part of the tree |
| [ROADMAP.md](https://github.com/MoatLab/FEMU/blob/master/ROADMAP.md) | What landed recently and what is planned |
| [CITATION.cff](https://github.com/MoatLab/FEMU/blob/master/CITATION.cff) | Machine-readable citation for the FAST '18 paper |

Licences for the code, the manual and this site are on the [licensing page](/docs/community/licensing). How decisions are made is on the [governance page](/docs/community/governance).

## Start contributing

The [first model test](/docs/community/first-test) is a small, runnable exercise
with a downloadable patch. It needs a C compiler and Make, without a guest or KVM.

The [developer learning path](/docs/community/developer-path) takes you from a
standalone test through tracing a write, comparing policies, and preparing a
change for review. You can contribute a clearer example or a reproducible bug
report before changing the emulator.

For a course or reading group, [Teach with FEMU](/docs/community/teaching)
organizes these activities by learning objective, prerequisites, and student
deliverables.

## What we could use help with

The project's own gaps are not a secret, and several are good entry points:

- Run the published configuration recipes in a guest and report the exact
  software versions and results.
- Add regression cases for command errors, namespace isolation, and interactions
  among supported policies.
- Improve examples that explain how to interpret counters and reproduce an
  experiment.
- Check mode documentation against guest-visible behavior and report differences.

## Funding

FEMU's ecosystem work is supported by the U.S. National Science Foundation
under Award No. [2550145](https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2550145), *POSE Phase I: Toward a
Community-Driven Fast Emulator (FEMU) Ecosystem for Next-Generation Storage
Systems Research and Innovation*, from June 1, 2026 to May 31, 2027.

The award funds scoping and planning for a sustainable, community-governed
FEMU ecosystem, not new emulator features. Its three objectives:

1. Ecosystem discovery and community engagement: learn who uses FEMU, for
   which use cases, and what keeps people from contributing.
2. Contributor infrastructure and training: onboarding paths, continuous
   integration and testing.
3. Governance and security: a transparent governance charter and security
   policies.

Any opinions, findings and conclusions or recommendations expressed in this
material are those of the author(s) and do not necessarily reflect the views
of the National Science Foundation.
