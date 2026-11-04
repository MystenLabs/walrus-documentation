---
title: "Walrus Memory MCP v0.0.18"
description: >-
  `MEMWAL_AUTO_SAVE` from the environment can no longer turn automatic memory saving on or skip the
  consent prompt, and SSE sessions reconnect reliably.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**October 30, 2026**

Project-level MCP config files such as `.cursor/mcp.json`, `.vscode/mcp.json`, or
`.claude/settings.json` populate `env`. Before this release, a truthy `MEMWAL_AUTO_SAVE` in those
files could override a stored `autoSave: false` or bypass the consent prompt on a new install. The
MCP server and plugin hooks now accept only a disabling override (`MEMWAL_AUTO_SAVE=0`) from `env`.
They keep `state` and `enabled` consistent and preserve `pendingConsent: true` until
`~/.memwal/settings.json` holds a stored answer.

Pending SSE readers now wake as soon as the connection aborts, so idle sessions reconnect without
waiting for the HTTP reader to fail.
