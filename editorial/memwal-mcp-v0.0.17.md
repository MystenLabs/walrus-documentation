---
title: "Walrus Memory MCP v0.0.17"
description: >-
  `memwal_remember_bulk` no longer registers a second paid Walrus blob when the bridge reconnects
  and replays a call.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**October 28, 2026**

This release fixes duplicate storage charges in `memwal_remember_bulk`. Previously, when the bridge
reconnected and replayed a bulk call, the call could register a second paid Walrus blob. The bridge
now stamps each call with a stable idempotency key before tracking it. The sidecar sends that key to
the relayer, and the relayer answers a replayed key with the jobs it already queued instead of
creating new ones.

This protection applies only to bridge replays. If your agent retries a bulk call itself, that retry
counts as a new call and gets a new key.

The plugin launcher in this release still installs MCP server 0.0.16. Plugin users get the fix from
v0.0.18.
