---
title: "Quick Start"
description: >-
  Install the Walrus Memory SDK, configure credentials, and store your first memory in under a minute. Covers installation for all three entry points and initial configuration.
keywords:
  - Walrus Memory
  - Walrus Memory
  - quick start
  - installation
  - first memory
  - SDK setup
goal:
  description: Install @mysten-incubation/memwal, configure your account ID, delegate key, and relayer URL, then call remember() and recall() to confirm end-to-end connectivity.
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
  - How do I install the Walrus Memory SDK?
  - How do I store my first memory with Walrus Memory?
  - What configuration is needed for the Walrus Memory SDK?
answer: >-
  Install the Walrus Memory SDK via npm, pnpm, or yarn with @mysten-incubation/memwal. Generate an account ID and delegate key from memory.walrus.xyz, then use Walrus Memory.create() with your key, accountId, and serverUrl to store and recall memories with the remember() and recall() methods.
---

<AgentPrompt
  prompt="Install @mysten-incubation/memwal in this project, create a MemWal client from the MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID, and MEMWAL_SERVER_URL environment variables, then store and recall a test memory to verify the setup."
/>

The Walrus Memory SDK gives your agents portable memory that works across apps, sessions, and workflows. Store, recall, and analyze context, fully under your control. It exposes three entry points:

| Entry point | Import | When to use |
| --- | --- | --- |
| `MemWal` | `@mysten-incubation/memwal` | **Recommended default** for most integrations, relayer handles embeddings, Seal, and storage |
| `MemWalManual` | `@mysten-incubation/memwal/manual` | You need client-managed embeddings and local Seal operations |
| `withMemWal` | `@mysten-incubation/memwal/ai` | You already use the Vercel AI SDK and want memory as middleware |

## How to install the Walrus Memory SDK

<Tabs groupId="pkg-manager">
<TabItem value="npm" label="npm">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ npm install @mysten-incubation/memwal
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ pnpm add @mysten-incubation/memwal
```

</TabItem>
<TabItem value="yarn" label="yarn">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ yarn add @mysten-incubation/memwal
```

</TabItem>
</Tabs>

For `MemWalManual`, you also need the optional peer dependencies:

<Tabs groupId="pkg-manager">
<TabItem value="npm" label="npm">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ npm install @mysten/sui @mysten/seal @mysten/walrus
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ pnpm add @mysten/sui @mysten/seal @mysten/walrus
```

</TabItem>
<TabItem value="yarn" label="yarn">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ yarn add @mysten/sui @mysten/seal @mysten/walrus
```

</TabItem>
</Tabs>

:::note
**Version compatibility:** `@mysten/seal` and `@mysten/walrus` must both accept the same `@mysten/sui` major. Known-good versions: `@mysten/sui@^2.16.2`, `@mysten/seal@^1.1.3`, `@mysten/walrus@^1.1.7`. Avoid `@mysten/walrus@0.x`, it bundles `@mysten/sui@1.x` and conflicts with `@mysten/seal@1.x`. If installation fails with `ERESOLVE` on `@mysten/sui`, upgrade `@mysten/walrus` and run `npm why @mysten/sui` to find which dependency still pins sui v1.
:::

For `withMemWal`, you also need:

<Tabs groupId="pkg-manager">
<TabItem value="npm" label="npm">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ npm install ai zod
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ pnpm add ai zod
```

</TabItem>
<TabItem value="yarn" label="yarn">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```bash
$ yarn add ai zod
```

</TabItem>
</Tabs>

## What configuration does the SDK need?

Before wiring the SDK into your app:

- These hosted endpoints are provided by Walrus Foundation.
- Generate a Walrus Memory account ID and delegate private key for your client using the hosted endpoint:
  - Production (Mainnet): `https://memory.walrus.xyz`
  - Staging (Testnet): `https://staging.memory.walrus.xyz`
- Choose a relayer:
  - Use the hosted relayer at `https://relayer.memory.walrus.xyz` (Mainnet) or `https://relayer-staging.memory.walrus.xyz` (Testnet)
  - Or deploy your own relayer with access to a wallet funded with WAL and SUI

`MemWal.create` takes a config object with the following fields:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | Yes | Ed25519 private key in hex |
| `accountId` | `string` | Yes | MemWalAccount object ID on Sui |
| `serverUrl` | `string` | No | Relayer URL, use `https://relayer.memory.walrus.xyz` (Mainnet) or `https://relayer-staging.memory.walrus.xyz` (Testnet) for the [managed relayer](/walrus-memory/relayer/public-relayer) |
| `namespace` | `string` | No | Default namespace, falls back to `"default"` |

## How to store your first memory

:::warning
**Use your own account, not an example one.** Generate your own `accountId` and delegate key at [memory.walrus.xyz](https://memory.walrus.xyz) before running. Recall is scoped per **account + namespace**, so writing against an account ID copied from docs or another project means your memories land in a shared space that everyone using it can read, instead of being isolated to you. The values below are placeholders; replace them with your own.
:::

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/quick-start.md" target="_blank" className="code-source-link">Source: sdk/quick-start.md</a>

```ts
import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  // Load your own credentials from the environment; never hardcode a shared example ID.
  key: process.env.MEMWAL_PRIVATE_KEY ?? "<your-ed25519-private-key>",
  accountId: process.env.MEMWAL_ACCOUNT_ID ?? "<your-memwal-account-id>",
  serverUrl: "https://your-relayer-url.com",
  namespace: "demo",
});

await memwal.health();
const job = await memwal.remember("I live in Hanoi and prefer dark mode.");
await memwal.waitForRememberJob(job.job_id);

const result = await memwal.recall({ query: "What do we know about this user?" });
console.log(result.results);
```

`remember()` returns a job. The example passes `job.job_id` to `waitForRememberJob()` to wait for that job to finish before it calls `recall()`.

## Next steps

- [Usage](/walrus-memory/sdk/usage), all three clients in detail, namespace rules, and restore
- [API Reference](/walrus-memory/sdk/api-reference), full method signatures and config fields
