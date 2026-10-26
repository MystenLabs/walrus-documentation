---
title: "Walrus Memory MCP v0.0.8"
description: "Pre-login tool discovery now returns human-readable tool titles and explicit `readOnlyHint` and `destructiveHint` metadata."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**August 14, 2026**

The Walrus Memory MCP server now includes human-readable titles for its tools during pre-login tool
discovery. Each tool also carries explicit `readOnlyHint` and `destructiveHint` metadata at that
stage. This metadata matches what the remote relayer provides to Claude connectors, so clients that
inspect tools before login get the same titles and hints as they would from the relayer.
