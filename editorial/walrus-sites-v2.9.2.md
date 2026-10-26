---
title: "Walrus Sites v2.9.2"
description: >-
  Walrus Sites 2.9.2 fixes portal SuiNS resolution so that lookups for names that do not exist no
  longer count as failures.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**May 21, 2026**

This patch release fixes how the portal handles SuiNS lookups. When a lookup returns `notExists`,
the portal no longer records it as an FN failure. Instead, it stops retrying immediately and
resolves the result to `null`.

The site-builder also updates its Sui and Walrus dependencies. The release adds no new features,
includes no breaking changes, and makes no Move contract changes.
