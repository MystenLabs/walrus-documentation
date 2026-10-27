---
title: "@ai-sdk Integration"
description: >-
  Integrate Walrus Memory with the Vercel AI SDK using the withMemWal middleware. Automatically recalls relevant memories before LLM generation and optionally saves new facts afterward.
keywords:
  - AI SDK integration
  - withMemWal
  - Vercel AI SDK
  - memory middleware
  - Walrus Memory
  - Walrus Memory
goal:
  description: Wrap a Vercel AI SDK generateText or streamText call with withMemWal to inject relevant memories into every prompt and persist notable outputs automatically.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 100
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - How do I integrate Walrus Memory with the Vercel AI SDK?
  - What does the withMemWal middleware do before and after generation?
  - When should I use direct SDK calls instead of withMemWal?
answer: >-
  The withMemWal middleware wraps a Vercel AI SDK model to add automatic memory. Before generation it recalls relevant memories and injects them into the prompt. After generation it optionally runs analyze() to extract and save facts asynchronously. Use direct SDK calls when you need precise control over storage timing, text analysis, or recall filtering.
---

Walrus Memory includes an AI SDK integration, exported from `@mysten-incubation/memwal/ai`, for applications that already use model middleware.

## `withMemWal`

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/ai-integration.md" target="_blank" className="code-source-link">Source: sdk/ai-integration.md</a>

```ts
import { generateText } from "ai";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { openai } from "@ai-sdk/openai";

const model = withMemWal(openai("gpt-4o"), {
  key: process.env.MEMWAL_PRIVATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "chatbot-prod",
  maxMemories: 5,
  autoSave: true,
});

const result = await generateText({
  model,
  messages: [{ role: "user", content: "What do you know about me?" }],
});
```

## What it does

Before generation:

- reads the last user message
- runs `recall()` against Walrus Memory
- filters by relevance (capped by the `maxMemories` option)
- injects memory context into the prompt

After generation:

- optionally runs `analyze()` on the user message
- saves extracted facts asynchronously

## Why namespace matters here

Set a namespace explicitly for each product surface that uses the middleware. Otherwise recalled
and auto-saved memories fall back to `"default"`.

## When to use direct SDK calls instead

Use direct SDK methods when your app needs precise control over:

- when memory is stored
- which text is analyzed
- how recall results are displayed or filtered
