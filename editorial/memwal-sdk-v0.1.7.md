---
title: "Walrus Memory TypeScript SDK v0.1.7"
description: "MemWal SDK 0.1.7 reports permanent decrypt failures from `restore()` and removes a Node builtin import that crashed browser builds."
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**September 15, 2026**

`restore()` results now include a `failed` count for permanent decrypt or UTF-8 failures. These were
previously folded into `skipped` or dropped silently. The field is required, like `truncated`, and
the SDK defaults it to `0` when omitted.

Request body hashing now uses `@noble/hashes` instead of WebCrypto with a `node:crypto` fallback.
Browser apps built with Vite no longer crash on the first remember or recall. The package now
declares `engines.node >= 20.0.0`. Empty-body 401 responses return the AUTH_REJECTED troubleshooting
message instead of suggesting `memwal_login`. Transactions in `account.ts` and `manual.ts` now use
typed `tx.pure` helpers that work with modern `@mysten/sui`.
