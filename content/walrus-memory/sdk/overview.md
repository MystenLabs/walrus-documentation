---
title: "Overview"
description: >-
  Overview of the Walrus Memory SDK surfaces for TypeScript and Python, including the three TypeScript entry points (Walrus Memory, MemWalManual, withMemWal) and the Python client with middleware support.
keywords:
  - Walrus Memory
  - Walrus Memory
  - SDK overview
  - TypeScript SDK
  - Python SDK
  - MemWalManual
goal:
  description: Compare the three SDK entry points — default Walrus Memory, manual MemWalManual, and AI middleware withMemWal — and select the one that matches your trust model and tech stack.
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
  - What SDK entry points does Walrus Memory offer?
  - Should I use the TypeScript or Python Walrus Memory SDK?
  - What is the difference between Walrus Memory, MemWalManual, and withMemWal?
answer: >-
  Walrus Memory provides TypeScript and Python SDKs. The TypeScript SDK has three entry points: Walrus Memory (recommended default, relayer-backed), MemWalManual (client-managed embeddings and local SEAL), and withMemWal (AI SDK middleware). The Python SDK mirrors the TypeScript Walrus Memory client with async-native support and LangChain/OpenAI middleware.
---

Walrus Memory exposes SDK surfaces for TypeScript and Python. The SDKs give your agents portable memory that works across apps, sessions, and workflows, fully under your control.


### `@mysten-incubation/memwal`

Use this first.

- relayer-backed
- best path for most teams
- main methods: `remember`, `recall`, `analyze`, `ask`, `restore`, `health`

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/overview.md" target="_blank" className="code-source-link">Source: sdk/overview.md</a>

```ts
import { MemWal } from "@mysten-incubation/memwal";
```

### `@mysten-incubation/memwal/manual`

Use this when the client must handle embeddings and local Seal operations.

- relayer still handles upload relay, registration, search, and restore

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/overview.md" target="_blank" className="code-source-link">Source: sdk/overview.md</a>

```ts
import { MemWalManual } from "@mysten-incubation/memwal/manual";
```

### `@mysten-incubation/memwal/ai`

Use this when you already use the AI SDK: `withMemWal` is AI SDK middleware.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/overview.md" target="_blank" className="code-source-link">Source: sdk/overview.md</a>

```ts
import { withMemWal } from "@mysten-incubation/memwal/ai";
```

---


### `memwal`

The Python SDK mirrors the TypeScript `MemWal` client exactly, same methods, same relayer, same auth flow. Built for the Python AI/ML ecosystem.

- relayer-backed (same managed relayer endpoints)
- Ed25519 signing through PyNaCl
- async-native with a sync convenience wrapper
- LangChain and OpenAI SDK middleware included

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/overview.md" target="_blank" className="code-source-link">Source: sdk/overview.md</a>

```bash
$ pip install memwal
$ pip install memwal[langchain]   # LangChain middleware
$ pip install memwal[openai]      # OpenAI SDK middleware
$ pip install memwal[all]         # everything
```

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/overview.md" target="_blank" className="code-source-link">Source: sdk/overview.md</a>

```python
from memwal import MemWal

memwal = MemWal.create(
    key="<your-ed25519-private-key>",
    account_id="<your-memwal-account-id>",
    server_url="https://relayer.memory.walrus.xyz",
    namespace="demo",
)
```

Main methods: `remember`, `recall`, `analyze`, `ask`, `restore`, `health`

Middleware: `with_memwal_langchain`, `with_memwal_openai`

---

## Namespace

All clients support a default namespace. If you omit it, it falls back to `"default"`.

## Recommended path

1. Start with `MemWal` (TypeScript) or `memwal` (Python)
2. Set a namespace explicitly
3. Validate `remember`, `recall`, `analyze`, and `restore`
4. Move to `MemWalManual` only if you need client-managed embeddings and local Seal work
