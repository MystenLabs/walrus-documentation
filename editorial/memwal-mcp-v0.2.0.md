---
title: "Walrus Memory MCP v0.2.0"
description: >-
  Adds `memwal_namespaces`, MCP server-card discovery metadata, and a `memwal_enable_proactive`
  setup prompt for chat clients without plugin hooks.
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**November 9, 2026**

This release adds `memwal_namespaces`, which returns a paginated inventory of account namespaces and
suggests namespaces when recall or restore returns nothing. Compatible clients can discover the
server through SEP-2127 metadata at `/.well-known/mcp/server-card.json`, `/mcp/server-card`, and
`/api/mcp/server-card`. For Claude Desktop, Claude web, and other chat clients without plugin
lifecycle hooks, the `memwal_enable_proactive` MCP prompt provides a one-time proactive-memory setup
flow with standard consent instructions in both bridge and auth-required modes.

Explanations of empty recall results now preserve exact legacy namespace names, including
surrounding whitespace. Optional namespace diagnostics stop after one second, so unavailable
metadata does not delay a completed recall or restore. The opt-in setup instruction again includes
focused proactive recall guidance and keeps recalled entries untrusted.
