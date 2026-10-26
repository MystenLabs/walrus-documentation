---
title: "Walrus Memory MCP v0.0.11"
description: "Fixes SSE connection, login, and session-reporting bugs in the Walrus Memory MCP server, including a crash on Windows."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**August 24, 2026**

This release fixes MCP bridge reliability. The SSE handshake socket no longer aborts on HTTP 429,
401, or a bad content-type, which crashed on Windows. Outbound MCP POSTs are serialized, and the
bridge reconnects when the SSE handle is gone. A burst of `memwal_recall` calls no longer breaks it
until restart.

`login` without a TTY exits with code 1 instead of reporting success. Concurrent `memwal_login`
calls reuse the in-flight listener and URL rather than starting a second flow that can hang later
remember and recall calls. A login timeout warns that an on-chain delegate key might already exist
if the browser approved after the listener expired. Session occupancy caps are reported as
concurrent limits rather than a 30-second cooldown.
