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
4. `recall` searches by Memory Space and returns decrypted matches

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

Rebuild missing indexed entries for one namespace. `restore()` takes the namespace as its first argument and returns a result object. Incremental, namespace-scoped, and meant to
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
