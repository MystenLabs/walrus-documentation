---
title: "Walrus Memory MCP v0.0.10"
description: >-
  The MCP server sends proactive memory instructions in the `initialize` handshake and returns a
  retryable error for orphaned tool calls.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**August 20, 2026**

The MCP server now sends proactive-usage instructions in the MCP `initialize` handshake. The model
knows when to save and recall memories even when your client lazily loads tool descriptions. The
bridge carries these instructions at cold start. Signed-out sessions get guidance pointing at
`memwal_login` and a conservative `tools/list`. `memwal_recall` is advertised as read-only. The
UserPromptSubmit hook lets the agent choose between remember and recall from meaning rather than
keywords.

Tool calls whose upstream response never arrives return a retryable error after
`MEMWAL_MCP_CALL_TIMEOUT_MS` (default 240s) instead of hanging. `memwal_remember_bulk` uses your
configured namespace (`--namespace` / `MEMWAL_NAMESPACE`) when a call omits one.
`serverInfo.version` reports the real package version.
