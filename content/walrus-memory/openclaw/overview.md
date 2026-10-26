---
title: "NemoClaw/OpenClaw Plugin"
description: >-
  Give your OpenClaw AI agents portable, verifiable memory powered by Walrus Memory.
  The plugin adds automatic recall and capture hooks alongside optional LLM tools and CLI commands.
keywords:
  - OpenClaw
  - NemoClaw
  - Walrus Memory
  - Walrus Memory
  - agent memory
  - plugin
goal:
  description: Assess whether the OpenClaw Walrus Memory plugin fits your agent's needs, identify its key features (automatic recall, encrypted storage, user-owned), and decide whether to install it or use MCP-only.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 300
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - What is the Walrus Memory plugin for OpenClaw?
  - How does Walrus Memory work with OpenClaw agents?
  - What features does the OpenClaw memory plugin provide?
answer: >-
  The Walrus Memory plugin for OpenClaw adds portable, verifiable agent memory that works alongside OpenClaw's file-based memory. It automatically recalls relevant context and captures new facts in the background using hooks, with no user action needed. Features include SEAL-encrypted storage on Walrus, cross-app memory portability, multi-agent namespace isolation, prompt injection protection, optional LLM tools (memory_search, memory_store), and CLI commands for debugging.
---

The Walrus Memory plugin adds **portable, verifiable agent memory** to OpenClaw agents. It works alongside OpenClaw's existing file-based memory, automatically recalling relevant context and capturing new facts in the background, with no user action needed. Memory is not locked to a single runtime: it operates across agents, apps, and workflows.

## Features

<Cards>
  <div className="feature-card">

**Automatic Recall**

Relevant memories are injected into the LLM's context before each conversation turn

</div>
  <div className="feature-card">

**Automatic Capture**

Facts are extracted from conversations and stored as encrypted memories after each turn

</div>
  <div className="feature-card">

**Fully Under Your Control**

Seal-encrypted, stored on Walrus, programmable permissions and explicit ownership over your data

</div>
  <div className="feature-card">

**Portable Across Apps**

Memories stored from any Walrus Memory-connected app are accessible to your OpenClaw agent, not locked to a single provider

</div>
  <div className="feature-card">

**Multi-Agent Isolation**

Each agent gets its own memory space through namespaces, no cross-contamination

</div>
  <div className="feature-card">

**Prompt Injection Protection**

Detection and HTML escaping on both read and write paths

</div>
  <div className="feature-card">

**Agent Tools**

Optional `memory_search` and `memory_store` tools for explicit LLM control

</div>
  <div className="feature-card">

**CLI Commands**

`openclaw memwal search` and `openclaw memwal stats` for debugging and inspection

</div>
</Cards>

## When to use this

- You want your OpenClaw agents to **remember across conversations**, preferences, decisions, context
- You need **encrypted, user-owned memory** instead of plaintext files or platform-managed storage
- You want **cross-app continuity**, memories from other Walrus Memory-connected apps (chatbot, noter, researcher) surface in OpenClaw
- You're running **multiple agents** and need each to have its own isolated memory space

## Get started

<Cards>
  <Card title="Quick Start" href="/walrus-memory/openclaw/quick-start">
    Install, configure, and verify the plugin in minutes
  </Card>
  <Card title="How It Works" href="/walrus-memory/openclaw/how-it-works">
    Architecture, message flow, hooks vs tools
  </Card>
  <Card title="Reference" href="/walrus-memory/openclaw/reference">
    Hooks, tools, CLI, configuration, and troubleshooting
  </Card>
  <Card title="Source Code" href="https://github.com/MystenLabs/MemWal/tree/main/packages/openclaw-memory-memwal">
    Browse the source on GitHub
  </Card>
</Cards>
