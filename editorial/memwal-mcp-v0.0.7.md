---
title: "Walrus Memory MCP v0.0.7"
description: "Walrus Memory MCP 0.0.7 reloads credentials after browser login without a client restart and tightens handshake and restore handling."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**August 14, 2026**

This release contains three fixes. After you log in through the browser, the MCP server now reloads
your credentials, so you no longer need to restart the MCP client.

Handshake handling is stricter. The server rejects stale handshakes and prevents requests from being
replayed across account changes.

Restores now report when results are truncated, and the server enforces the relayer's bounded
restore limit.
