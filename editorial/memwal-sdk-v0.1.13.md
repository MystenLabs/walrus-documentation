---
title: "Walrus Memory TypeScript SDK v0.1.13"
description: >-
  `MemWal` and `MemWalMock` now share input validation and consistently reject invalid
  `idempotencyKey` values and `limit: 0`.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**November 4, 2026**

`MemWal` and `MemWalMock` apply the same input validation on `remember*`, `rememberBulk*`,
`analyze*`, `embed`, `recall`, `restore`, and `listNamespaces`. Both reject invalid `idempotencyKey`
values before signing, and both reject `limit: 0` consistently.

On read paths (`recall`, `recallManual`, `restore`, and `listMemories`), the SDK rejects an empty
string `""` as a namespace. Namespaces that contain only whitespace remain readable, which matches
the server's namespace validation.
