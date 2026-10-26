---
title: "Walrus Memory MCP v0.0.16"
description: >-
  Walrus Memory MCP 0.0.16 updates the MCP SDK to 1.32.1 and blocks redirects on authenticated SSE
  requests to the relayer.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**October 26, 2026**

This release updates `@modelcontextprotocol/sdk` to 1.32.1, which includes transport security fixes.

Authenticated SSE GET and POST requests now refuse redirects. The message endpoint that the server
supplies must stay on the configured relayer origin. Because of this, custom authentication headers
and tool arguments cannot be forwarded to a redirected origin. If your deployment relies on
redirects to reach the relayer, configure the final relayer URL directly.
