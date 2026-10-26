---
title: "Walrus v1.55.2"
description: >-
  Storage nodes expose a new `node_recovery_baseline_invalidations_total` metric that counts node-
  recovery baseline invalidations.
keywords: ["walrus", "release notes", "changelog", "mainnet"]
---

**Mainnet** | September 2, 2026

This release adds one storage node metric, `node_recovery_baseline_invalidations_total`. It counts
the sync-and-recovery info publications that invalidate the node-recovery baseline and supersede
in-flight node-recovery runs. If you operate a storage node, you can add this counter to your
monitoring to track how often in-progress node-recovery runs are superseded. The release body
describes no other changes to storage node behavior, configuration, or client-facing APIs. The same
change ships in both the Mainnet and Testnet releases of this version.
