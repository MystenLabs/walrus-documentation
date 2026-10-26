---
title: "Walrus Memory MCP v0.0.12"
description: >-
  Adds a `maxDistance` cutoff to `memwal_recall`, forwards MCP client identity to the relayer, and
  adds a `MEMWAL_CREDS_DIR` override.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**September 9, 2026**

`memwal_recall` accepts an optional `maxDistance` cosine-distance cutoff, which must be 0 or
greater. It drops hits with `distance >= maxDistance`, and result lines now show both `score` and
`distance`. The server forwards the client's `initialize.clientInfo` to the relayer as
`x-memwal-client` and `x-memwal-client-version`, so sidecar logs name the coding agent.

The credential directory now resolves on every access, and `MEMWAL_CREDS_DIR` overrides it. This
fixes a Windows problem where the test suite overwrote `~/.memwal/credentials.json` and its delegate
key. `memwal_restore` now clarifies that `truncated=true` is retryable and that `truncated=false`
does not guarantee completeness.
