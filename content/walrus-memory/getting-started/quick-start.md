---
title: Quick Start
description: >-
  Get Walrus Memory running in minutes using the TypeScript SDK, from installing the SDK and
  generating credentials to configuring the client and storing and recalling your first memory.
keywords:
  - Walrus Memory
  - Walrus Memory
  - quick start
  - TypeScript SDK
  - installation
  - setup
goal:
  description: "Get a working end-to-end Walrus Memory integration: install the SDK, create an account at memory.walrus.xyz, call remember() to store a memory, and confirm recall() returns it."
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
  - How do I get started with Walrus Memory?
  - How do I install the Walrus Memory TypeScript SDK?
  - How do I store and recall my first memory with Walrus Memory?
answer: >-
  To get started with Walrus Memory, install the @mysten-incubation/memwal TypeScript SDK,
  generate an account ID and delegate key from the Walrus Memory Playground, choose a relayer
  endpoint, configure the SDK client, and call remember and recall to store and retrieve memories.
---

<AgentPrompt
  prompt="Run `curl -sL https://memory.walrus.xyz/skills/setup` and use the returned instructions to set up Walrus Memory in this AI client."
/>

The fastest way to get Walrus Memory running is through the TypeScript SDK.

<div className="outlined-tabs">

<Tabs>
<TabItem value="prereq" label="Prerequisites">

- [x] [Node.js](https://nodejs.org/) v22.23.4+ (or v24.22.1+ or v26.12.1+) or [Bun](https://bun.sh/) v1+

</TabItem>
</Tabs>

</div>


### Install the SDK

    <Tabs groupId="pkg-manager">
      <TabItem value="pnpm" label="pnpm">
        ```bash
        pnpm add @mysten-incubation/memwal
        ```
      </TabItem>
      <TabItem value="npm" label="npm">
        ```bash
        npm install @mysten-incubation/memwal
        ```
      </TabItem>
      <TabItem value="yarn" label="yarn">
        ```bash
        yarn add @mysten-incubation/memwal
        ```
      </TabItem>
      <TabItem value="bun" label="bun">
        ```bash
        bun add @mysten-incubation/memwal
        ```
      </TabItem>
    </Tabs>

    **Optional packages**

    For AI middleware with [Vercel AI SDK](https://sdk.vercel.ai/) (`@mysten-incubation/memwal/ai`):

    <Tabs groupId="pkg-manager">
      <TabItem value="pnpm" label="pnpm">
        ```bash
        pnpm add ai
        ```
      </TabItem>
      <TabItem value="npm" label="npm">
        ```bash
        npm install ai
        ```
      </TabItem>
      <TabItem value="yarn" label="yarn">
        ```bash
        yarn add ai
        ```
      </TabItem>
      <TabItem value="bun" label="bun">
        ```bash
        bun add ai
        ```
      </TabItem>
    </Tabs>

    For the [manual client flow](/walrus-memory/getting-started/choose-your-path) (`@mysten-incubation/memwal/manual`):

    <Tabs groupId="pkg-manager">
      <TabItem value="pnpm" label="pnpm">
        ```bash
        pnpm add @mysten/sui @mysten/seal @mysten/walrus
        ```
      </TabItem>
      <TabItem value="npm" label="npm">
        ```bash
        npm install @mysten/sui @mysten/seal @mysten/walrus
        ```
      </TabItem>
      <TabItem value="yarn" label="yarn">
        ```bash
        yarn add @mysten/sui @mysten/seal @mysten/walrus
        ```
      </TabItem>
      <TabItem value="bun" label="bun">
        ```bash
        bun add @mysten/sui @mysten/seal @mysten/walrus
        ```
      </TabItem>
    </Tabs>

  ### Generate your account ID and delegate key

    Create a Walrus Memory account ID and delegate private key for your SDK client using one of the hosted endpoints below.

    :::info
Walrus Foundation provides the following endpoints as a public good.
:::

    | **App** | **URL** |
    | --- | --- |
    | **Walrus Memory Playground** | [memory.walrus.xyz](https://memory.walrus.xyz) |

    For the contract-based setup flow, see [Delegate Key Management](/walrus-memory/contract/delegate-key-management) and [Walrus Memory smart contract](/walrus-memory/contract/overview).

  ### Choose a relayer

    Use a hosted relayer, or deploy your own [self-hosted relayer](/walrus-memory/relayer/self-hosting) with access to a wallet funded with WAL and SUI:

    :::info
Walrus Foundation provides the following endpoints as a public good.
:::

    | **Network** | **Relayer URL** |
    | --- | --- |
    | **Production** (Mainnet) | `https://relayer.memory.walrus.xyz` |
    | **Staging** (Testnet) | `https://relayer-staging.memory.walrus.xyz` |

  ### Configure the SDK

    Set up the SDK with your delegate key, account ID, and relayer URL:

    ```ts
    import { MemWal } from "@mysten-incubation/memwal";

    const memwal = MemWal.create({
      // Load your own credentials from the environment; don't hardcode an example ID.
      key: process.env.MEMWAL_KEY ?? "<your-ed25519-private-key>",
      accountId: process.env.MEMWAL_ACCOUNT_ID ?? "<your-memwal-account-id>",
      serverUrl: "https://relayer.memory.walrus.xyz",
      namespace: "my-app",
    });
    ```

    :::warning
Use the `accountId` **you** generated in the previous step. Recall scope is per **account and namespace**. Reusing an account ID copied from docs or another project puts your memories in a shared space instead of isolating them to you.
:::

  ### Verify your connection

    Run a health check to confirm everything is working:

    ```ts
    await memwal.health();
    ```

  ### Store and recall your first memory

    ```ts
    const job = await memwal.remember("User prefers dark mode and works in TypeScript.");
    await memwal.waitForRememberJob(job.job_id);

    const result = await memwal.recall({ query: "What do we know about this user?" });
    console.log(result.results);
    ```

    Walrus Memory is now running.

If Walrus Memory is useful to you, [a star on the GitHub repository](https://github.com/MystenLabs/MemWal) helps others find it.
