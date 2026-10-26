---
title: "Walrus Memory TypeScript SDK v0.1.5"
description: >-
  `rememberManual` now sends base64 SEAL ciphertext as `encryptedData` instead of a `blobId`, and
  `recall()` reports `dropped_count`.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**August 26, 2026**

`rememberManual` now sends `encryptedData`, a base64 SEAL ciphertext, instead of a pre-uploaded
`blobId`, matching `POST /api/remember/manual`. `recall()` results include `dropped_count` when the
relayer omits matches that fail to download or decrypt. `health()` surfaces an optional
`write_ready` field when the relayer reports write-path sidecar liveness.

Manual recall now decodes SEAL object IDs with `hexToBytes`. This removes the risk of coercing `NaN`
to `0` or throwing on empty input. HTTP error messages and remember-job error strings no longer
expose `localhost` or `127.0.0.1` URLs to callers.
