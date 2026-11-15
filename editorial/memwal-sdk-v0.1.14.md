---
title: "Walrus Memory TypeScript SDK v0.1.14"
description: >-
  `RecallResult` now flags dropped matches with `degraded`, and a new `onDropped` option can throw
  when every recall match fails.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**November 9, 2026**

`RecallResult` includes an optional `degraded?: boolean` flag. It is `true` whenever `recall()`
drops one or more vector matches. By default, when every match fails to download or decrypt,
`recall()` returns a degraded result with `results: []`, `degraded: true`, and `dropped_count`.

`RecallOptions` accepts a new `onDropped?: "ignore" | "throw"` setting, which defaults to
`"ignore"`. If you pass `onDropped: "throw"`, `recall()` throws `MemWalRecallAllDroppedError` when
every vector search match is dropped during Walrus blob download or SEAL decryption. The error has
`name = "MemWalRecallAllDropped"` and `code = "RECALL_ALL_DROPPED"`, and it exposes `total`,
`droppedCount`, and `namespace`.
