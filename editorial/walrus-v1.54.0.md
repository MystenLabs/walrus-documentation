---
title: "Walrus v1.54.0"
description: "Requests for expired or nonexistent quilts now fail fast with a not-found error instead of timing out against storage nodes."
keywords: ["walrus", "release notes", "changelog", "mainnet"]
---

**Mainnet** | August 19, 2026

The aggregator now returns 404 `BLOB_NOT_FOUND` within about a second for requests for quilt patches
of expired or nonexistent quilts. Previously, these requests returned 503 `BLOB_UNAVAILABLE` after a
10 to 20 second fan-out to storage nodes.

In the CLI, `walrus read-quilt` now fails immediately with "the blob ID does not exist" when you
read an expired or never-certified quilt. Previously, the command timed out against the storage
nodes.
