---
title: "Walrus Memory TypeScript SDK v0.1.11"
description: >-
  Walrus Memory SDK 0.1.11 adds opt-in content-hash deduplication to `remember` calls and tightens
  key handling and input validation.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**October 28, 2026**

`remember`, `rememberAsync`, and `rememberAndWait` accept `{ dedupe: true }` for opt-in content-hash
deduplication per owner, namespace, and text, with no time window. Duplicate writes collapse onto
the existing live job and `blob_id`. If the memory was forgotten or deleted, the client writes it
fresh. `MemWalMock` mirrors this behavior.

`MemWal.create` and `MemWalManual.create` copy a supplied `Uint8Array` key, so `destroy()` leaves
your buffer intact. `MemWalManual.destroy()` also drops cached secrets and rejects later calls.
`formatUntrustedMemories` and `withMemWal` drop non-finite distances and clamp relevance to [0, 1].
`listNamespaces`, `listMemories`, and the manual vector methods validate inputs before signing.
`analyze()` accepts an abort `signal`.
