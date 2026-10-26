---
title: "Walrus Sites v2.7.0"
description: >-
  The site builder no longer fails with `InsufficientGas` on large sites and retries deploys after
  transient Sui object version conflicts.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**March 12, 2026**

This release improves the reliability of the site builder. Large sites, those with 500 or more
routes or resources, no longer fail with `InsufficientGas` errors. These failures came from
programmable transaction block (PTB) byte-size overflow, which the site builder now prevents.

Site deployment also handles transient Sui object version conflicts better. When a conflict occurs,
the site builder automatically retries the operation with exponential backoff instead of failing.
