---
title: "Walrus v1.55.1"
description: "Storage nodes expose a new `node_recovery_baseline_invalidations_total` metric that tracks invalidations of the node-recovery baseline."
keywords: ["walrus", "release notes", "changelog", "testnet"]
---

**Testnet** | August 28, 2026

This Testnet release adds one metric to the storage node. The
`node_recovery_baseline_invalidations_total` metric counts sync-and-recovery info publications that
invalidate the node-recovery baseline. Each publication it counts also supersedes any in-flight
node-recovery runs.

If you operate a storage node, this metric shows how often baseline invalidations supersede
in-flight node-recovery runs.
