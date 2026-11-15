---
title: "Walrus v1.60.1"
description: >-
  Storage nodes now restart a checkpoint tailing task that stops on its own, so event processing no
  longer stalls.
keywords: ["walrus", "release notes", "changelog", "testnet"]
---

**Testnet** | November 4, 2026

This Testnet release fixes a storage node issue with checkpoint tailing. Previously, if the
checkpoint tailing task stopped on its own, the node's event processing stalled. This could happen,
for example, when the full node failed to serve a Move package. Storage nodes now restart the task
after a backoff, and event processing resumes.
