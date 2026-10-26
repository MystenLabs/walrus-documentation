---
title: "Walrus Memory MCP v0.0.6"
description: >-
  Walrus Memory MCP 0.0.6 requires a localhost preflight handshake before accepting delegate-key
  login callbacks and fixes request authentication.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**July 31, 2026**

This release tightens the delegate-key login flow. Before it accepts a login callback, the MCP
server now requires a localhost preflight handshake that proves the exact state, public key, and
relayer. The server also takes the canonical login label from the verified local flow and no longer
trusts the label that the browser callback supplies.

MCP SSE POST messages and replayed requests now authenticate with the delegate credentials.
