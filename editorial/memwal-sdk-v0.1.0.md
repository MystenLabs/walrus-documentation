---
title: "Walrus Memory TypeScript SDK v0.1.0"
description: "Treats recalled AI memory as untrusted, nonce-delimited data and adds sponsor authorization helpers and migration-aware configuration."
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**July 31, 2026**

Recalled AI memory now arrives as nonce-delimited, explicitly untrusted data instead of content
injected directly into the system role.

This release adds sponsor authorization helpers for sponsored transaction flows. It also adds
migration-aware account and manual configuration, including registry support and support for current
Sui transaction results. Account transaction result handling and failure diagnostics improve across
both legacy and current Sui response shapes.
