---
title: "MemWalManual"
description: >-
  Client-managed embeddings and local SEAL operations with MemWalManual. The client handles embedding and encryption locally while the relayer manages upload, vector registration, and search. Ideal for Web3-native users who want to minimize trust in the relayer.
keywords:
  - MemWalManual
  - client-side encryption
  - SEAL
  - agent state
  - key management
  - Walrus Memory
goal:
  description: Initialize MemWalManual for browser wallet signing or headless agents, call registerEntry() with a pre-uploaded blob and pre-computed embedding, and use search() to run a vector query without storage.
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
  - How do I use MemWalManual for client-side encryption?
  - What is the difference between Walrus Memory and MemWalManual?
  - How do I integrate MemWalManual with a browser wallet?
answer: >-
  MemWalManual is the client-managed entry point where the client handles embedding calls and local SEAL operations while the relayer manages upload relay, vector registration, and search. It supports both suiPrivateKey for headless agents and walletSigner for browser integration, and is recommended for Web3-native users who want plaintext to never leave the client.
---

Use when the client must handle embedding calls and local Seal operations. The relayer still handles
upload relay, vector registration, search, and restore.

This is the recommended path for Web3-native users who want to minimize trust in the relayer, because it never sees your plaintext data.

## What the client handles versus what the relayer handles

| Operation | Client (MemWalManual) | Relayer |
|-----------|----------------------|---------|
| Embedding | Client calls OpenAI/compatible API | |
| Seal encryption | Client encrypts locally | |
| Walrus upload | | Server uploads through a sidecar (server pays gas) |
| Vector registration | | Server stores `{blob_id, vector}` in PostgreSQL |
| Recall search | | Server searches vectors, returns `{blob_id, distance}` |
| Walrus download | Client downloads from aggregator | |
| Seal decryption | Client decrypts locally (SessionKey; one wallet popup in browser mode) | |

## How to set up MemWalManual

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal-manual.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal-manual.md</a>

```ts
import { MemWalManual } from "@mysten-incubation/memwal/manual";

const manual = MemWalManual.create({
  key: "<your-ed25519-private-key>",
  serverUrl: "https://your-relayer-url.com",
  suiPrivateKey: "<your-sui-private-key>",    // OR walletSigner
  embeddingApiKey: "<your-openai-api-key>",
  packageId: "<memwal-package-id>",
  registryId: "<account-registry-id>",
  accountId: "<memwal-account-id>",
  namespace: "chatbot-prod",
});
```

The `key` field is the delegate key that authenticates the client to the relayer. It differs from `suiPrivateKey`, which signs the Seal and Walrus operations that encrypt and store the data. For more on how the two keys work together, see [Agent state: holding your own keys](#agent-state-holding-your-own-keys).

## Core methods

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal-manual.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal-manual.md</a>

```ts
// Embed locally, encrypt locally, relay encrypted payload + vector
await manual.rememberManual("User prefers dark mode.");

// Embed locally, search via relayer, download and decrypt locally
const result = await manual.recallManual("What do we know?", 5);
for (const memory of result.results) {
  console.log(memory.text, memory.distance);
}

// Same relayer restore endpoint
await manual.restore("chatbot-prod", 10);

// Check if using a connected wallet signer
console.log(manual.isWalletMode);
```

## What happens when you call `rememberManual`?

1. Client generates embedding through OpenAI-compatible API
2. Client Seal-encrypts the plaintext locally (encryption is local, so this step needs no wallet signature; the wallet prompt appears only during recall, when the client creates the Seal SessionKey in browser mode)
3. Client sends `{encrypted_data (base64), vector}` to the relayer
4. Relayer uploads encrypted bytes to Walrus through upload-relay sidecar (server pays gas)
5. Relayer stores `{blob_id, vector, owner, namespace}` in PostgreSQL

## What happens when you call `recallManual`?

1. Client generates query embedding through OpenAI-compatible API
2. Client sends the vector to the relayer
3. Relayer searches PostgreSQL and returns `{blob_id, distance}` hits
4. Client downloads all matching encrypted blobs from Walrus concurrently
5. Client creates a single Seal SessionKey (one wallet popup in browser mode)
6. Client decrypts each blob locally using the shared session key

## How to use MemWalManual with a browser wallet

Use `walletSigner` instead of `suiPrivateKey` when integrating with a connected wallet (for example, `@mysten/dapp-kit`):

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal-manual.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal-manual.md</a>

```ts
const manual = MemWalManual.create({
  key: "<your-ed25519-delegate-key>",
  walletSigner: {
    address: walletAddress,
    signAndExecuteTransaction: signAndExecuteTransaction,
    signPersonalMessage: signPersonalMessage,
  },
  embeddingApiKey: "<your-openai-api-key>",
  packageId: "<memwal-package-id>",
  registryId: "<account-registry-id>",
  accountId: "<memwal-account-id>",
});
```

## Config notes

- `suiNetwork` defaults to `mainnet`
- `packageId` is the immutable first-published package used by Seal; after a
  compatible upgrade, set `sealPolicyPackageId` to the current policy package
- `sealServerConfigs` lets the client configure independent or committee Seal servers; committee entries require `aggregatorUrl`
- `sealKeyServers` remains supported as a legacy independent key server object ID override
- Walrus publisher, aggregator, and upload relay defaults follow `suiNetwork`
- `embeddingModel` defaults to `text-embedding-3-small` (or `openai/text-embedding-3-small` for OpenRouter)
- `walrusEpochs` defaults to `50` (storage duration)
- All `@mysten/*` peer dependencies are loaded dynamically, so users who only use the default `MemWal` client do not need them installed

## Agent state: holding your own keys

Every blob on Walrus is public, so you must encrypt private agent state before storing it. For an autonomous agent that has no human to approve a wallet popup, `MemWalManual` is the path that keeps the agent in control of its own key material: encryption happens client-side, and the relayer never receives plaintext.

A headless agent signs Seal and Walrus operations with its own Sui key rather than a connected wallet. Provide `suiPrivateKey` instead of `walletSigner`, set `suiNetwork` for your environment, and load every secret from the environment:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/usage/memwal-manual.md" target="_blank" className="code-source-link">Source: sdk/usage/memwal-manual.md</a>

```ts
import { MemWalManual } from "@mysten-incubation/memwal/manual";

const manual = MemWalManual.create({
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  packageId: process.env.MEMWAL_PACKAGE_ID!,
  sealPolicyPackageId: process.env.MEMWAL_SEAL_POLICY_PACKAGE_ID,
  registryId: process.env.MEMWAL_REGISTRY_ID!,
  serverUrl: "https://relayer-staging.memory.walrus.xyz",
  suiPrivateKey: process.env.SUI_PRIVATE_KEY!,
  embeddingApiKey: process.env.OPENAI_API_KEY!,
  suiNetwork: "testnet",
  namespace: "agent-state",
});

// Encrypts locally, then relays only ciphertext to the server.
await manual.rememberManual("Private: internal risk score for account 0xabc is 0.82.");

const hits = await manual.recallManual("risk score for account 0xabc", 5);
for (const memory of hits.results) {
  console.log(memory.text, memory.distance);
}
```

The agent holds two distinct secrets:

- The **delegate key** (`key`) authenticates the agent to the relayer.
- The **Sui key** (`suiPrivateKey`) signs the Seal and Walrus operations that encrypt and store the data.

:::warning
With client-managed encryption the agent owns its key material. If the Sui key is lost, you cannot recover the encrypted memories, so treat it as a production secret and rotate the delegate key through the dashboard if it might be exposed.
:::

For the full headless write, confirm, and recall loop that builds on this, see [Agent Storage Loop](/walrus-memory/sdk/agent-storage-loop).

## Restore parameters

The first argument of `restore` is the namespace to rebuild. The second argument, `limit`, is optional and defaults to `10`. It must be a positive integer, otherwise the client throws a `TypeError`. The method takes no other parameters.

Restore inspects your onchain blobs newest-first, up to `limit`, and re-indexes only blobs the relayer does not already have. Restore has no pagination cursor, so repeating a call at the same limit re-inspects the same newest blobs. To rebuild a large namespace, rerun restore with a progressively higher `limit` until `restored` stops increasing.
