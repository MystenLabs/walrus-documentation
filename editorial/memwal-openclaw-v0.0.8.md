---
title: "Walrus Memory OpenClaw v0.0.8"
description: >-
  Auto-capture bounds session state and skips captured turns, timeouts abort requests, and
  `memory_store` reports pending jobs accurately.
keywords: ["memwal-openclaw", "release notes", "changelog"]
---

**October 28, 2026**

Auto-capture keeps state for at most 1,000 recent session scopes and expires scopes after 30 idle
minutes, so long-lived gateways stop retaining every past session. A per-session message watermark
skips already-captured turns, and `occurredAt` uses each message's creation timestamp. `withTimeout`
aborts the HTTP request when `requestTimeoutMs` expires, `withRetry` skips timed-out calls, and an
in-flight guard prevents overlapping auto-capture requests.

`memory_store` no longer reports pending jobs as stored. It polls `waitForRememberJobs` when
available, surfaces upload failures, and otherwise reports `"Accepted N fact(s) (not stored yet;
job_ids=...)"`. The plugin also detects letter-spaced prompt injection, such as `i g n o r e`, and
uses MemWal SDK `0.1.10`.
