---
title: "Advanced Usage"
description: >-
  Advanced Walrus Memory SDK usage patterns including manual registration with pre-computed vectors, fact extraction with analyze(), and AI SDK middleware integration.
keywords:
  - Walrus Memory
  - advanced usage
  - manual registration
  - analyze
  - AI middleware
  - rememberManual
  - recallManual
  - withMemWal
goal:
  description: Call registerEntry() to store a pre-uploaded blob, use analyze() to extract and store structured facts from long content, and wire up withMemWal middleware for automatic recall in AI generation pipelines.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 50
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - How do I use manual registration with pre-computed vectors in Walrus Memory?
  - How does analyze() extract facts in Walrus Memory?
  - When should I use advanced Walrus Memory features?
answer: >-
  Advanced Walrus Memory features include manual registration (rememberManual/recallManual) for pre-computed vectors and encrypted payloads, analyze() for LLM-based fact extraction from longer text, and withMemWal AI middleware for automatic recall before generation and auto-save after generation.
---

Advanced Walrus Memory features include manual registration (`rememberManual()` and `recallManual()`) for precomputed vectors and encrypted payloads, `analyze()` for LLM-based fact extraction from longer text, and the `withMemWal` AI middleware for automatic recall before generation and auto-save after generation (on by default; set `autoSave: false` to turn it off). The relayer uploads your encrypted payloads to Walrus and extracts structured facts for `analyze()`.

## When to use advanced features

- you already have a vector or encrypted payload
- you want fact extraction with `analyze()`
- you want memory inside an AI SDK pipeline

## How to use manual registration and recall

Use:

- `rememberManual()` when you already have encrypted payload plus vector
- `recallManual()` when you already have a query vector

## How does `analyze()` extract facts?

Use `analyze()` for LLM-based fact extraction when you want the relayer, which also uploads your encrypted payloads to Walrus, to extract structured facts from longer text and store them as
memories.

## How to use the `withMemWal` middleware

Wire up the `withMemWal` middleware for automatic recall in AI generation pipelines when you want:

- recall before generation
- auto-save after generation (on by default; set `autoSave: false` to turn it off)

## Read next

- [SDK Usage](/walrus-memory/sdk/usage)
- [AI Integration](/walrus-memory/sdk/ai-integration)

## What parameters do the manual methods take?

Both manual methods take an options object:

- `rememberManual({ encryptedData, vector, namespace? })`: `encryptedData` is a base64-encoded string of Seal-encrypted bytes that the relayer uploads to Walrus. `vector` is your precomputed embedding (`number[]`). `namespace` defaults to the config namespace or `default`. The result contains `id`, `blob_id`, `owner`, and `namespace`.
- `recallManual({ vector, limit?, namespace? })`: `vector` is your precomputed query embedding (`number[]`). `limit` must be a positive integer (default 10, relayer caps at 100). You can also pass optional `scoringWeights`. Each hit contains only `blob_id` and `distance`, with no decrypted text.

Both methods reject an empty or non-finite `vector` before signing. `rememberManual` rejects a missing or blank `encryptedData` string with `TypeError`.
