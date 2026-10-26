---
title: "Walrus Memory MCP v0.0.14"
description: "The MCP plugin launches a trusted install instead of `npx`, adds opt-in Streamable HTTP, and returns writes at accept by default."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**September 22, 2026**

The plugin no longer starts the MCP server through `npx`, which could run a package planted in the
open project. Every launch site now runs `plugin/scripts/launch_mcp.mjs`. It installs the pinned
version under `~/.memwal/runtime` and fails rather than falling back. `MEMWAL_MCP_RUNTIME_DIR`
relocates that directory and must be an absolute path.

`memwal_remember` and `memwal_remember_bulk` now return a `job_id` at accept by default. Set
`MEMWAL_MCP_REMEMBER_WAIT_MS=90000` to wait for a `blob_id`. Set `MEMWAL_MCP_TRANSPORT=http` to use
Streamable HTTP, though replayed writes might duplicate. Timeouts report the cause and relayer
health. The bridge honors `retry_after`, `memwal_remember_status` accepts `job_ids`, and delegate
keypairs persist before browser sign-in.
