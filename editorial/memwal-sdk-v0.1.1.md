---
title: "Walrus Memory TypeScript SDK v0.1.1"
description: "Walrus Memory SDK 0.1.1 adds `flush()` for pending `withMemWal` auto-saves and a `truncated` field on restore results."
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**August 7, 2026**

This release adds `flush()`, which you can call to handle pending auto-saves from `withMemWal`.
Restore results now include a `truncated` field that indicates when a recovery is incomplete, so
your code can detect partial restores.

`AUTH_REJECTED` errors now link to troubleshooting guidance, giving you a direct path to resolving
authentication rejections.
