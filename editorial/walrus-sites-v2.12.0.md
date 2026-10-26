---
title: "Walrus Sites v2.12.0"
description: >-
  The portal adds an optional glob-based route and redirect matcher, and the site-builder stops
  using JSON-RPC-only client methods.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**July 10, 2026**

The portal adds a glob-based matcher for routes and redirects, available behind a flag. The matcher
enforces a cap on the number of patterns. This is the first step of the portal's routing migration.

The site-builder no longer relies on client methods that only work through JSON-RPC, ahead of the
JSON-RPC deprecation. This release also updates the site-builder's Walrus dependencies to
testnet-v1.51.2.
