---
title: "Walrus Sites v2.0.0"
description: "The `site-builder` CLI now stores all site data in Quilts, which reduces publishing cost and time, and requires Walrus CLI v1.35.0 or later."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**November 17, 2025**

This release removes legacy blob publishing and the `experimental-quilts` feature flag. The portal
still serves both Quilt and blob-based sites. Updating a site re-uploads all site data. If that is a
concern, test on testnet first, republish to a new site and point SuiNS to it, or stay on
mainnet-v1.3.1.

The `--check-extend`, `--watch`, `--parallel-stores`, and `--max-concurrent` flags are removed.
`update-resource` is renamed to `update-resources`, which accepts multiple `local_path:site_path`
pairs. A default 512 MiB limit per Quilt, which also caps individual file size, applies; override it
with `--max-quilt-size`. Patch identifiers now use the resource's site path. `StoredQuiltPatch`
gains a `range` field for Walrus CLI v1.35 compatibility.
