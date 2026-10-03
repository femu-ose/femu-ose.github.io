---
title: Licensing
description: "Which licence covers FEMU's code, its in-tree documentation, the website's own pages, and the downloads on this site."
---

# Licensing

| What | Licence | Source |
| --- | --- | --- |
| FEMU source code | GNU General Public License v2.0 or later | [README, License](https://github.com/MoatLab/FEMU/blob/master/README.md#license) |
| Inherited QEMU code and firmware | The licence in each file; QEMU itself is GPL-2.0 | [LICENSE](https://github.com/MoatLab/FEMU/blob/master/LICENSE) |
| The FEMU Manual (`hw/femu/docs`, mirrored under [/manual](/manual)) | GPL-2.0-or-later, as part of the FEMU tree; each page names its source file and commit | [Manual](/manual) |
| The website's own pages (Get started, design notes, experiment tools, research, community, news) | [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/) | This page |
| Downloads: configurations, patches, tools | The licence stated in the file; patches against FEMU are GPL-2.0-or-later | [downloads.json](pathname:///downloads.json) lists each file and its SHA-256 |
| The NSF logo | Not covered by the site licence; used under the [NSF Policy on Brand Standards](https://www.nsf.gov/policies/brand) to acknowledge Award No. 2550145 | Footer |

## Why GitHub shows "Other"

The repository's root `LICENSE` file is QEMU's explanation of how the emulator
and its firmware are licensed, not a single licence text, so GitHub cannot
classify it and reports "Other". FEMU's own code is GPL-2.0-or-later, as the
README states and [CITATION.cff](https://github.com/MoatLab/FEMU/blob/master/CITATION.cff)
records (`license: GPL-2.0-or-later`).

## Reusing website material

You may copy and adapt the website's own pages, for example in course
material, with attribution: "From the FEMU website, CC BY 4.0", with a link to
the page. Text mirrored from the manual keeps its GPL terms.
