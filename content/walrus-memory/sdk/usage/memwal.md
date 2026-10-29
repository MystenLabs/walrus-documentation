---
title: "Walrus Memory"
description: >-
  The recommended default Walrus Memory client where the relayer handles embeddings, SEAL encryption, Walrus upload, and vector indexing. Covers core methods like remember, recall, analyze, and restore.
keywords:
  - Walrus Memory
  - Walrus Memory
  - remember
  - recall
  - analyze
  - restore
goal:
  description: Call remember(), recall(), analyze(), and restore() on the default Walrus Memory client and understand the parameters and return values for each operation.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 200
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - How do I use the default Walrus Memory client?
  - What methods does the Walrus Memory client provide?
  - How does remember and recall work in Walrus Memory?
answer: >-
  The default Walrus Memory client is the recommended entry point where the relayer handles embeddings, SEAL encryption, Walrus upload, and vector indexing. It provides remember() for storing memories, recall() for semantic search, analyze() for fact extraction, and restore() for rebuilding missing index entries.
---

The recommended default client. The relayer handles embeddings, Seal encryption, Walrus upload, and vector indexing.

## How it works

1. The SDK signs each request with your delegate key
2. The relayer verifies delegate access
3. `remember(text)` takes the memory text and returns an accepted job whose `job_id` you pass to `waitForRememberJob()`, while the relayer encrypts, uploads, and indexes in the background
4. `recall({ query, limit })` takes the search `query` and an optional `limit` on the number of matches, searches the client's memory space (owner address, namespace, and app ID), and returns decrypted matches

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal.md</a>

```ts
import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  key: "<your-ed25519-private-key>",
  accountId: "<your-memwal-account-id>",
  serverUrl: "https://your-relayer-url.com",
  namespace: "chatbot-prod",
});
```

## Core methods

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal.md</a>

```ts
// Store a memory
const job = await memwal.remember("User prefers dark mode and works in TypeScript.");
await memwal.waitForRememberJob(job.job_id);

// Recall relevant memories
const result = await memwal.recall({ query: "What do we know about this user?", limit: 5 });

// Extract and store facts from longer text
const analyzed = await memwal.analyze(
  "I live in Hanoi, prefer dark mode, and usually work late at night."
);
console.log(analyzed.job_ids);

// Check relayer health
await memwal.health();
```

## Restore

Rebuild missing indexed entries for one namespace. `restore()` takes the namespace as its first argument and an optional `limit` as its second, the maximum number of blobs to inspect in that call (default 10), as in `restore("chatbot-prod", 10)`, and returns a result object. Incremental, namespace-scoped, and meant to
repair PostgreSQL vector state from Walrus-backed memory.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal.md</a>

```ts
const result = await memwal.restore("chatbot-prod", 10);
```

## Lower-level methods

Use these when you already have a vector or encrypted payload:

- `rememberManual({ encryptedData, vector, namespace? })`
- `recallManual({ vector, limit?, namespace? })`
- `embed(text)`

## What `analyze()` returns

The relayer extracts facts synchronously and returns one `job_id` per fact, then embeds, encrypts, uploads, and indexes each fact in the background. The `analyze()` result contains:

- `job_ids`: one polling ID per extracted fact
- `facts`: each entry has `text` (the extracted fact), `id` (same value as `job_id`), and `job_id`
- `fact_count`: the number of accepted facts
- `status`: usually `pending`
- `owner`: the owner address

To wait until every extracted fact is stored, use `analyzeAndWait(text, namespace?, opts?)`.

## Read recall results

The `recall` result holds its matches in `result.results`. Each match carries the decrypted `text` and a `distance`, where a smaller number means a closer match:

```ts
for (const memory of result.results) {
  console.log(memory.distance.toFixed(3), memory.text);
}
```

`recall` returns up to `limit` results, defaulting to `10`, and gives no signal when it drops extra matches. Treat a result count equal to `limit` as a sign that more matches might exist.
