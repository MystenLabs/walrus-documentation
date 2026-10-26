---
title: "Walrus Memory TypeScript SDK v0.1.6"
description: >-
  `recall()` results now include `created_at`, and `RecallOptions` adds `sort` and `scoringWeights`
  for ordering memories by recency or relevance.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**September 9, 2026**

`recall()` results include an optional `created_at` field with the RFC3339 write-time of the stored
fact. `RecallOptions` accepts `sort: "relevance" | "recent"` and `scoringWeights`. With `sort:
"recent"`, the SDK over-fetches semantic candidates (5x `limit`, capped at 50), orders them by
write-time descending, and then truncates the results to `limit`.

The SDK now reports an HTTP 503 with `x-auth-error: AUTH_UPSTREAM_UNAVAILABLE` as a retryable
credential-verification outage instead of a sign-in failure. Other 503 responses keep the generic
sanitized body, and empty-body 401 responses still point you to `memwal_login`.
