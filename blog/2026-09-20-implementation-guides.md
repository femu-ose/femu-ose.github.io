---
title: Explore FEMU's implementation, policies, and configurations
description: Source-linked guides, complete configurations, and a developer learning path for storage experiments.
slug: implementation-guides
---

The FEMU documentation now connects device features to the code that implements
them. Start with the [implementation overview](/docs/implementation), choose a
device mode, and follow its configuration and source links.

{/* truncate */}

The guides describe mapping and garbage-collection policies, NAND timing,
configuration interactions, and the boundaries of each device model. They are
pinned to FEMU commit `9d176f89138dfb00dcd2fba2aa61072268d9bf4a` so readers can
check a description against the reviewed implementation.

- [Configuration recipes](/docs/configuration-recipes) provide 19 complete
  examples with downloadable INI files.
- [Observability](/docs/observability) explains counter interpretation and
  includes a decoder for FEMU's vendor statistics log.
- The [developer learning path](/docs/community/developer-path) starts with a
  standalone test, follows a write through the emulator, and explains how to
  prepare a focused contribution.

The configurations have been checked against source declarations and expanded
through the configuration helper. Guest execution remains a separate validation
step. When sharing results or reporting a problem, include the FEMU commit,
complete configuration, guest kernel and tools, and workload command.

Found a missing prerequisite or a mismatch with the code? Use the
[community guide](/docs/community) to share a reproducible report or contribute
a correction.
