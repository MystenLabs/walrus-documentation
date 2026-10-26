---
title: "Walrus Memory TypeScript SDK v0.1.8"
description: >-
  Every relayer request now has a deadline, configurable with `requestTimeoutMs`, and generated
  idempotency keys derive from content.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**September 22, 2026**

All relayer requests now carry a deadline, so one stalled request no longer runs past `timeoutMs`.
Requests default to 30 seconds, and you can change this with `requestTimeoutMs` on `MemWal.create`.
`restore` and `analyze` each use 60 seconds. An expired request raises `MemWalRequestTimeout` with
`status: 504`, which the existing poll handling retries.

Generated idempotency keys now derive from the namespace, the text, and a 30-minute bucket. A replay
from a new client therefore no longer creates a duplicate paid Walrus blob. Explicit
`idempotencyKey` values are unaffected. `recall()` also sends `deadline_ms`. Relayers that read it
return a 504 with `serverCode` `RECALL_TIMEOUT` that names the stuck step.
