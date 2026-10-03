---
title: Governance
description: "How FEMU decisions are made today, the rules contributors follow, and the proposed governance charter open for community comment."
---

# Governance

FEMU is developed in the public [MoatLab/FEMU](https://github.com/MoatLab/FEMU)
repository. This page separates the rules that are in effect today from a
proposed charter that is open for comment. Writing that charter with the
community is one of the three objectives of FEMU's NSF award
([community page](/docs/community#funding)).

## In effect today

These rules come from the repository's
[CONTRIBUTING.md](https://github.com/MoatLab/FEMU/blob/master/CONTRIBUTING.md),
[CODE_OF_CONDUCT.md](https://github.com/MoatLab/FEMU/blob/master/CODE_OF_CONDUCT.md)
and [SECURITY.md](https://github.com/MoatLab/FEMU/blob/master/SECURITY.md). Where
this page and those files differ, the files win.

| Topic | Rule |
| --- | --- |
| Design first | Open an issue for a new feature so the design is agreed before the code is written |
| Behaviour changes | A feature that changes device behaviour is opt-in (a device property, off by default) unless it fixes a bug |
| Tests | Every fix and feature carries a test that fails without the change and passes with it |
| Style | `scripts/checkpatch.pl` reports no errors or warnings; QEMU coding style |
| Provenance | Each commit is signed off (`git commit -s`) under the Developer Certificate of Origin |
| Review | A maintainer responds to a pull request within 72 hours |
| Conduct | Every project space follows the Code of Conduct |
| Security | Vulnerabilities are reported privately through GitHub, acknowledged within 3 business days |

Today the project lead at Virginia Tech's MoatLab merges changes and sets
priorities, with the [roadmap](https://github.com/MoatLab/FEMU/blob/master/ROADMAP.md)
as the public record of what is planned.

## Proposed charter (draft for comment)

:::caution[Not adopted]

This section is a proposal. It takes effect only after the comment period
below and a decision recorded in the repository. Until then, the rules above
are the only ones in force.

:::

The proposal follows the pattern of mature open-source projects such as HPX
and gem5: named roles, a default decision rule, and a short list of decisions
that need more than that.

### Roles

| Role | Who | Can |
| --- | --- | --- |
| User | Anyone who runs FEMU | Ask questions, report issues, propose changes |
| Contributor | Anyone with a merged change, review, test, tutorial or doc | Review pull requests and vote in discussions (advisory) |
| Reviewer | A contributor named for one area (a mode, the FTL, the NVMe front end, CXL, docs) | Approve pull requests in that area |
| Maintainer | A reviewer trusted with the whole tree | Merge, cut releases, triage security reports |
| Steering group | The maintainers plus up to two contributors elected by contributors | Decide what the default rule cannot, below |

A contributor becomes a reviewer, and a reviewer a maintainer, when an existing
maintainer nominates them in a public issue and no maintainer objects within
seven days. Inactive roles (no review or commit for twelve months) become
emeritus and can be restored the same way.

### How decisions are made

- **Default: lazy consensus.** A pull request or proposal that meets the rules
  above and draws no reviewer objection within 72 hours of a review request
  can be merged by a maintainer. An objection must say what would resolve it.
- **Needs an issue and a reviewer's approval:** a new device mode, a new
  device property, or any change to guest-visible behaviour.
- **Needs a steering-group majority:** changes to this charter, to the
  licence, to the Code of Conduct, adding or removing maintainers when there is
  an objection, and the release schedule.
- **A release cannot be blocked** by a single objection once the steering group
  has scheduled it; known issues go in the release notes instead.

Decisions are recorded where they are made: in the pull request, the issue, or
a dated note in the repository for steering-group votes.

### Releases

The proposal is a tagged release at least twice a year, each with a changelog
section, a documentation snapshot on this site, and the commit this site's
manual was synced from.

### Conflicts of interest

Reviewers and maintainers disclose an employer or funding interest in a change
they review, and step aside from deciding on it when another reviewer is
available.

## Comment on the proposal

Comment in [GitHub Discussions](https://github.com/MoatLab/FEMU/discussions),
on [Discord](https://discord.gg/AgPTUJCw7), or on the
[mailing list](https://groups.google.com/g/femu). Say which part you would change and
why. To help maintain a subsystem now, open a discussion with your relevant
contributions and the area you want to review.
