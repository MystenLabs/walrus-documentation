---
title: "Walrus Memory sdk v0.1.10"
description: "The MemWal SDK now validates scoring weights, whitespace-only text, and malformed 2xx responses on the client side."
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**October 26, 2026**

This release tightens input and response validation in the MemWal SDK. `remember`, `rememberBulk`,
`analyze`, `embed`, and `recall` reject text made only of whitespace and zero-width format
characters before signing. They return the same error as blank text instead of waiting for the
client timeout, and `MemWalMock` rejects the same set.

A 2xx response that contains valid JSON of the wrong shape raises an SDK error that names the
endpoint, not a raw `TypeError`. The bulk status error is not retried. `waitForRememberJob` throws
`MemWalRememberJobNotFoundError` when the status body is null or not an object.
`MemWal.recallManual` and `MemWalManual.recallManual` reject non-finite `scoringWeights` values
before signing, matching `recall`.
