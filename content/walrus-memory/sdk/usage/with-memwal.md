---
title: "withMemWal"
description: >-
  Drop-in memory middleware for Vercel AI SDK apps. Automatically recalls relevant memories before generation and optionally saves new facts after generation.
keywords:
  - withMemWal
  - Vercel AI SDK
  - middleware
  - memory recall
  - auto-save
  - Walrus Memory
goal:
  description: Wrap a Vercel AI SDK streamText or generateText call with withMemWal, configure the recall and save filters, and verify that relevant memories are injected and notable outputs are persisted.
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
  - How do I add memory to a Vercel AI SDK app?
  - What does the withMemWal middleware do?
  - When should I use withMemWal vs direct SDK calls?
answer: >-
  withMemWal is drop-in memory middleware for Vercel AI SDK apps. Before generation it recalls relevant memories and injects them into the prompt. After generation it optionally runs analyze() to extract and save new facts. Use direct SDK calls instead when you need precise control over when memory is stored or how recall results are used.
---

Drop-in memory middleware for Vercel AI SDK apps.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/with-memwal.md" target="_blank" className="code-source-link">Source: sdk/usage/with-memwal.md</a>

```ts
import { generateText } from "ai";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { openai } from "@ai-sdk/openai";

const model = withMemWal(openai("gpt-4o"), {
  key: "<your-ed25519-private-key>",
  accountId: "<your-memwal-account-id>",
  serverUrl: "https://your-relayer-url.com",
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

- Reads the last user message
- Runs `recall()` against Walrus Memory
- Filters by relevance, returning at most the `maxMemories` set in the options (`maxMemories: 5` in the example above)
- Injects memory context into the prompt

After generation:

- Optionally runs `analyze()` on the user message
- Saves extracted facts asynchronously

Set a namespace explicitly for each product surface that uses the middleware. Otherwise recalled
and auto-saved memories fall back to `"default"`.

## When to use direct SDK calls instead

Use direct SDK methods when your app needs precise control over:

- When memory is stored
- Which text is analyzed
- How recall results are displayed or filtered

## When does auto-save run?

When `autoSave` is `true`, the middleware saves only on the first step of a user turn, when the prompt ends with a user message. It skips intermediate tool steps where the last message comes from a tool or the assistant. On a qualifying step, the middleware takes the last user message and passes it to `analyze()`. The relayer runs LLM-based fact extraction on that message and stores the extracted facts. The save runs fire-and-forget, so it does not delay the generated response. `recall()` only reads memories before generation. `analyze()` is the write path that runs after generation.

## How do you filter recalled memories?

Beyond the `MemWalConfig` fields, `withMemWal` accepts `maxMemories`, `autoSave`, `minRelevance`, and `debug`. It has no callback-based recall or save filter.

- `minRelevance`: minimum similarity score (0 to 1) that a recalled memory needs to reach the prompt. The default is `0.3`. A value of `0` turns off the relevance filter.
- `autoSave`: turns saving after generation on or off. The default is `true`.

To choose exactly which text the app stores or how it filters recall results, call the SDK methods directly instead of relying on the middleware.
