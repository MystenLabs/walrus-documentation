---
slug: /
title: What is Walrus Memory?
description: >-
  Walrus Memory enables AI agents to operate reliably across apps and sessions without losing context.
  It provides portable, verifiable, and fully controlled memory that lets agents handle complex workflows
  and coordinate using data they can trust.
keywords:
  - Walrus Memory
  - Walrus Memory
  - AI agent memory
  - portable memory
  - verifiable memory
  - agent coordination
goal:
  description: Explain the core problem Walrus Memory solves, describe its key capabilities (portable, verifiable, permissioned), and assess whether it fits your agent's memory requirements.
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
  - What is Walrus Memory?
  - How does Walrus Memory help AI agents retain context across sessions?
  - What are the core features of Walrus Memory?
answer: >-
  Walrus Memory (Walrus Memory) is a portable, verifiable memory layer for AI agents that persists context
  across apps, sessions, and workflows. It provides programmable access control, agent coordination
  through shared memory spaces, and memory integrity that can be independently verified without
  centralized trust.
---

Walrus Memory enables AI agents to operate reliably across apps and sessions, without losing context. Portable, verifiable, and fully controlled by you, it's the memory layer that lets agents handle complex workflows and coordinate using data they can trust.

<Cards>
  <div className="feature-card">

**Portable by Design**

Memory operates across agents, apps, and workflows without binding to a single runtime or provider

</div>
  <div className="feature-card">

**Fully Under Your Control**

Programmable permissions and explicit ownership define how memory is shared, accessed, and updated

</div>
  <div className="feature-card">

**Built for Agent Coordination**

Shared memory spaces help agents coordinate across long-running and multi-step workflows

</div>
  <div className="feature-card">

**Verifiable Integrity**

Anyone can independently verify memory integrity without centralized trust

</div>
</Cards>

## Why do agents need Walrus Memory?

AI agents today lose context between sessions: every conversation starts from scratch. When memory does exist, vendors lock it inside platform-specific databases that the user doesn't control. Walrus Memory solves this by giving agents:

- **Portable memory:** Memory persists outside prompts and context windows, moving across agents, apps, and workflows.
- **Full owner control:** Programmable access control and explicit ownership, with delegate access for agents and workflows.
- **Agent coordination:** Shared memory spaces help agents coordinate across long-running and multi-step workflows.
- **Verifiable integrity:** Anyone can independently verify memory integrity without centralized trust.

## What are the core features of Walrus Memory?

Walrus Memory groups its features into memory operations, ownership and access control, and infrastructure.

### Memory operations

<Cards>
  <div className="feature-card">

**Remember**

Store memories with semantic understanding. The [relayer](/walrus-memory/relayer/overview), the service that handles storage and retrieval behind a basic API, generates vector embeddings so your data is searchable by meaning, not just keywords.

</div>
  <div className="feature-card">

**Recall**

Retrieve relevant memories using natural language queries. Finds the closest matches based on meaning, scoped to your memory space.

</div>
  <div className="feature-card">

**Analyze**

Extract structured facts from text automatically. Each fact lands as a separate memory for more precise recall later.

</div>
  <div className="feature-card">

**Ask**

Query your memories and get an AI-generated answer with the relevant context attached. Combines recall with LLM reasoning.

</div>
</Cards>

### Ownership and access control

<Cards>
  <div className="feature-card">

**Decentralized Storage**

Walrus stores the blobs, with no single point of failure and no central operator holding your data.

</div>
  <div className="feature-card">

**Programmable Permissions**

Sui smart contracts enforce ownership and access rules, giving you explicit, programmable control over who can read and write.

</div>
  <div className="feature-card">

**Delegate Access**

Grant scoped access to other agents, users, or services. The owner manages every grant onchain, enabling agent coordination and cross-app workflows.

</div>
</Cards>

### Infrastructure

<Cards>
  <div className="feature-card">

**Restore**

Rebuild your index from Walrus if it's ever lost. Rediscovers blobs by owner and namespace, re-embeds only missing entries.

</div>
  <div className="feature-card">

**AI Middleware**

Drop-in memory for Vercel AI SDK apps. Automatically saves and recalls context around AI conversations.

</div>
</Cards>

## What's included

- **TypeScript SDK:** [Integrate memory](/walrus-memory/sdk/quick-start) into any app with a few lines of code.
- **Relayer:** Handles storage and retrieval behind a basic API.
- **Smart Contract:** [Enforces ownership and delegate access](/walrus-memory/contract/overview) onchain.
- **Indexer:** [Keeps onchain state synced](/walrus-memory/indexer/purpose) for fast lookups.
- **Dashboard:** Manage accounts, memory, and delegate keys visually.

## What can you build with Walrus Memory?

Walrus Memory fits any app where agents need memory that travels with them:

- **AI chat apps:** Capture valuable knowledge from conversations so agents remember context across sessions and apps.
- **Multi-agent workflows:** Shared memory spaces let agents coordinate on task lists, knowledge bases, and coordination state.
- **Personal AI assistants:** Build agents that learn and adapt over time, with memory the user fully controls.
- **Cross-app memory:** Let users carry their memory between different apps and services instead of binding them to a single provider.
- **Note-taking and knowledge tools:** Save user insights, summaries, and references as portable, verifiable memory.

The [example apps](#example-apps) show Walrus Memory in action.

## Example apps

The repo ships with ready-to-run apps in the [`/apps`](https://github.com/MystenLabs/MemWal/tree/main/apps) directory:

- **Playground:** Dashboard demo for Walrus Memory.
- **Chatbot:** AI chat app with portable memory across sessions.
- **Noter:** Note-taking tool that stores knowledge as verifiable memory.
- **Researcher:** Research assistant that builds and recalls a knowledge base.

See [Example Apps](/walrus-memory/examples/example-apps) for short code examples from each app.

If Walrus Memory is useful to you, [a star on the GitHub repo ⭐](https://github.com/MystenLabs/MemWal) helps others find it.

## Explore the docs

<Cards>
  <Card title="Concepts" href="/walrus-memory/fundamentals/concepts/memory-space">
    Memory spaces, ownership and delegates
  </Card>
  <Card title="Architecture" href="/walrus-memory/fundamentals/architecture/core-components">
    System overview, component responsibilities, core flows, data flow security
  </Card>
  <Card title="SDK" href="/walrus-memory/sdk/quick-start">
    Quickstart, usage patterns, AI integration, and examples
  </Card>
  <Card title="Relayer" href="/walrus-memory/relayer/overview">
    Managed relayer, installation and setup, self-hosting
  </Card>
  <Card title="Smart Contract" href="/walrus-memory/contract/overview">
    Onchain ownership model, delegate key management, permissions
  </Card>
  <Card title="Indexer" href="/walrus-memory/indexer/purpose">
    Event indexing, onchain events, database sync
  </Card>
  <Card title="Reference" href="/walrus-memory/sdk/api-reference">
    SDK API, relayer API, configuration, environment variables
  </Card>
</Cards>
