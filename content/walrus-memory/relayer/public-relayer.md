---
title: Managed Relayer
description: >-
  Use the Walrus Foundation-hosted managed relayer to get started with Walrus Memory without running infrastructure. Covers available endpoints, minimal SDK configuration, and the trust and availability trade-offs of the shared deployment.
keywords:
  - Walrus Memory
  - Walrus Memory
  - managed relayer
  - public relayer
  - hosted endpoint
  - getting started
goal:
  description: Configure the SDK to use the managed Walrus Memory relayer, understand which data it can access and what that means for trust, and decide when to switch to a self-hosted alternative.
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
  - "What is the Walrus Memory managed relayer URL?"
  - "How do I connect to the public Walrus Memory relayer?"
  - "What are the trade-offs of using the managed Walrus Memory relayer?"
answer: >-
  The Walrus Foundation hosts managed relayer endpoints for production (Mainnet) at relayer.memory.walrus.xyz and staging (Testnet) at relayer-staging.memory.walrus.xyz. The managed relayer provides the fastest integration path but involves trusting the hosted instance with plaintext during encryption, sharing the deployment with other users, and accepting that the service carries no SLA guarantees.
---

A managed relayer is a simpler experience for teams that want to get started without running infrastructure. If a managed relayer endpoint is available for your environment, it gives you the fastest path to integration.

## Walrus Foundation hosted endpoints

| **Network** | **Relayer URL** |
|---|---|
| **Production** (Mainnet) | `https://relayer.memory.walrus.xyz` |
| **Staging** (Testnet) | `https://relayer-staging.memory.walrus.xyz` |

## Minimal config

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/relayer/public-relayer.md" target="_blank" className="code-source-link">Source: relayer/public-relayer.md</a>

```ts
import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  key: "<your-ed25519-private-key>",
  accountId: "<your-memwal-account-id>",
  serverUrl: "https://relayer.memory.walrus.xyz",
  namespace: "demo",
});
```

## What to know

- **Shared App ID:** All users of the managed relayer share the same Walrus Memory package ID. Your own `owner + namespace` (Memory Space) isolates your data, but all users share the underlying deployment.
- **Trust assumption:** The relayer sees plaintext during encryption and embedding. By using the managed relayer, you're trusting the Walrus Foundation-hosted instance with that data. See [Trust and Security Model](/walrus-memory/fundamentals/architecture/data-flow-security-model) for details.
- **Availability:** The Walrus Foundation provides the managed relayer as a public good without SLA guarantees.

## Storage costs

The managed relayer covers WAL storage fees and SUI gas through its server wallets and configured gas sponsor. Account holders do not pay gas or WAL for these relayed writes. Account ownership does not determine which wallet pays for an upload. The shared service applies usage limits.

With a [self-hosted relayer](/walrus-memory/relayer/self-hosting), you fund the relayer deployment.

If you need full control over the trust boundary or your own dedicated instance, see [Self-Hosting](/walrus-memory/relayer/self-hosting).

## Where does encryption happen?

With the default `MemWal` client, the managed relayer receives your plaintext, generates embeddings, and encrypts each item with Seal before storing it on Walrus. You do not manage keys in this flow.

To keep plaintext on the client, use `MemWalManual` from `@mysten-incubation/memwal/manual`. The client generates embeddings and performs Seal encryption locally, and the relayer only receives encrypted payloads and precomputed vectors. See [MemWalManual](/walrus-memory/sdk/usage/memwal-manual) for the client-managed flow.
