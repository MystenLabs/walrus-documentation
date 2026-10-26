---
title: "Walrus Memory TypeScript SDK v0.1.2"
description: >-
  Walrus Memory SDK 0.1.2 adds offline mock clients for credential-free tests and idempotency keys
  that collapse retries onto one paid remember job.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**August 14, 2026**

This release adds deterministic offline mock clients, so you can run tests without credentials. It
also adds idempotency keys, which collapse retries onto a single paid remember job.

Fixes isolate foreign manual-recall blobs and safely encode large encrypted payloads. The SDK now
supports both Zod 3 and Zod 4 as peer dependencies.
