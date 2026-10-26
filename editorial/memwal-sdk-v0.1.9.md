---
title: "Walrus Memory TypeScript SDK v0.1.9"
description: >-
  Restores the default Sui client, adds automatic bulk idempotency keys, and tightens input
  validation and remember-job waits in the MemWal SDK.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**October 21, 2026**

`createAccount`, `addDelegateKey`, `removeDelegateKey`, and `MemWalManual` work again without a
`suiClient`. The default is now `SuiGrpcClient` against the public fullnode for `suiNetwork`.
`rememberBulk` and `rememberBulkAsync` send a derived idempotency key, so a retry within 30 minutes
returns the same jobs. `listMemories()` pages stored memories as metadata without a similarity
query.

Remember-job waits back off toward a 5s cap. On timeout they raise `MemWalRememberJobTimeout` with
`lastStatus` and `serverError`, and they raise `MemWalRateLimited` when status reads stay
rate-limited. Many methods reject invalid input before signing, including bad `limit`,
`maxDistance`, job ids, and blank text. Package subpaths now resolve in Next.js, Turbopack, and Node
`require(esm)`, and `/manual` no longer imports `@mysten/walrus`.
