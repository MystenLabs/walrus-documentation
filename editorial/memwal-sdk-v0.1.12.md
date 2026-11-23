---
title: "Walrus Memory TypeScript SDK v0.1.12"
description: >-
  `withMemWal` bounds recall queries and auto-save input by UTF-8 byte size, so long user turns no
  longer trigger HTTP 400 errors.
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**October 30, 2026**

This release fixes how `withMemWal` handles long user turns. It caps the recall query at 16,384
UTF-8 bytes and uses `strategy: "head-tail"` to keep both the leading context and the trailing
question or instructions. It caps auto-save `analyze()` input at 65,536 UTF-8 bytes. Truncation
never splits a multi-byte UTF-8 codepoint across a boundary.

The language model prompt still receives the full user turn. Turns longer than the embedder's 16 KiB
limit still inject relevant memories without HTTP 400 errors. Auto-save extracts facts across turns
of up to 64 KiB.
