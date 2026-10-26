---
title: "Walrus Memory mcp v0.0.16"
description: "Walrus Memory MCP 0.0.16 updates `@modelcontextprotocol/sdk` to 1.32.1 and blocks redirects on authenticated SSE requests."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**October 26, 2026**

Authenticated SSE GET and POST requests now refuse redirects. The server-supplied message endpoint
must also stay on the configured relayer origin. Custom authentication headers and tool arguments
cannot be forwarded to a redirected origin. If your deployment relied on redirects, configure your
final relayer URL directly. The release also updates `@modelcontextprotocol/sdk` to 1.32.1 for its
transport security fixes.

This version is unreleased. Package and plugin manifests are bumped to 0.0.16, but the launcher
still installs the published 0.0.15 through `mcpPackageVersion` until 0.0.16 is available on npm.
Retarget that pin after publishing.
