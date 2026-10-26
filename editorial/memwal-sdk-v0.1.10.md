---
title: "Walrus Memory TypeScript SDK v0.1.10"
description: >-
  The SDK rejects non-finite scoring weights and whitespace-only text before signing, and reports
  malformed 2xx responses with clear errors.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**October 26, 2026**

This release tightens input and response validation in the Walrus Memory SDK. `recallManual` on
`MemWal` and `MemWalManual` rejects `NaN` or `Infinity` in `scoringWeights` before signing, matching
`recall`. Previously, `JSON.stringify` sent these values to the relayer as `null`. `remember`,
`rememberBulk`, `analyze`, `embed`, and `recall` also reject text containing only whitespace and
zero-width characters. Previously, these calls waited until the client timed out. `MemWalMock`
rejects the same input.

When a 2xx response has the wrong JSON shape, the SDK raises an error naming the endpoint and the
missing array instead of a raw `TypeError`. The SDK does not retry these bulk status errors. A null
or non-object status body makes `getRememberStatus` return `not_found` and `waitForRememberJob`
throw `MemWalRememberJobNotFoundError`.
