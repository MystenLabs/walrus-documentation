---
title: Cookbook - Multi-Tenant Server Apps
description: >-
  Serve many end users from one MemWalAccount using a delegate key on the server and a namespace per user wallet. Covers the full pattern for SaaS-style apps with Next.js, security best practices, and delegate key lifecycle management.
keywords:
  - multi-tenant
  - SaaS
  - delegate key
  - namespace
  - Walrus Memory
  - Walrus Memory
goal:
  description: "Design a multi-tenant memory architecture: use the operator's MemWalAccount, organize each user's memory with a namespace, and enforce access in the authenticated server."
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
  - How do I build a multi-tenant app with Walrus Memory?
  - How do I isolate user memories in a SaaS app with Walrus Memory?
  - What is the security model for multi-tenant Walrus Memory apps?
answer: >-
  Use one MemWalAccount with a delegate key on the server and derive a deterministic namespace per authenticated user wallet. The server holds MEMWAL_PRIVATE_KEY and MEMWAL_ACCOUNT_ID as environment variables, computes the namespace from the verified wallet address, and never exposes the delegate key to the browser. Namespaces are data-organization boundaries, so cross-user isolation depends on proper server-side authentication.
---

This is the pattern for SaaS-style apps where **one operator** runs a server that stores memory on behalf of **many end users**. For example, a Next.js app on Vercel where users connect a Sui wallet only for sign-in, and the server holds the credentials.

## How does the multi-tenant pattern work?

| **Layer** | **What it holds** | **Why** |
| --- | --- | --- |
| **Operator** | One `MemWalAccount` + one **delegate key** | Created once on the [dashboard](https://memory.walrus.xyz). Owns all memory stored through this account. |
| **Server** (API routes) | `MEMWAL_PRIVATE_KEY` + `MEMWAL_ACCOUNT_ID` as env vars | The delegate key authenticates every relayer call. Never sent to the browser. |
| **End user** | A connected Sui wallet, used for **auth only** | The wallet proves identity. The user does **not** create a MemWalAccount. |
| **Organization** | One **namespace per wallet**, for example `myapp-{walletAddress}` | Groups each user's memories under the shared account. The server enforces who can access each group. |

This pattern uses the operator's account for every end user; signing in with a wallet does not create an account for that user or transfer memory ownership to them. See [Ownership and access](/walrus-memory/fundamentals/concepts/ownership-and-access).

The managed relayer sponsors writes; see [Managed relayer costs](/walrus-memory/relayer/public-relayer#storage-costs). The managed service applies its usage limits to this pattern like any other.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/cookbook-multi-tenant.md" target="_blank" className="code-source-link">Source: sdk/cookbook-multi-tenant.md</a>

```
                  ┌─────────────────────────────────────┐
  End user wallet │  Server (Next.js API route, Vercel)  │   Relayer + Walrus
  (auth only)     │                                      │
       │ sign-in  │  MemWal.create({                     │
       ├─────────▶│    key:       MEMWAL_PRIVATE_KEY,     │
       │          │    accountId: MEMWAL_ACCOUNT_ID,      │   one MemWalAccount
       │          │  })                                   │   ├─ ns: myapp-0xalice…
       │ request  │  ns = `myapp-${address.toLowerCase()}`│──▶├─ ns: myapp-0xbob…
       ├─────────▶│  memwal.remember(text, ns)            │   └─ ns: myapp-0xcarol…
       │          │  memwal.recall({ query, namespace })  │
       └──────────┴──────────────────────────────────────┘
```

## 1. Set up the delegate key (not the owner key)

Create the account and a delegate key once, on the [Walrus Memory dashboard](https://memory.walrus.xyz). The dashboard gives you:

- A **MemWalAccount object ID** (`0x…`) → your `MEMWAL_ACCOUNT_ID`
- A **delegate private key** (hex) → your `MEMWAL_PRIVATE_KEY`

:::warning
Use a **delegate key**, never the **owner** wallet key, in the application server. The owner manages the account and its delegates; a delegate authenticates memory operations across the account's namespaces. Revocation does not cover already-read data; see [Ownership and access](/walrus-memory/fundamentals/concepts/ownership-and-access#access-control-enforcement) and [Delegate key management](/walrus-memory/contract/delegate-key-management).
:::

Store both as server-side environment variables:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/cookbook-multi-tenant.md" target="_blank" className="code-source-link">Source: sdk/cookbook-multi-tenant.md</a>

```bash title=".env.local"
MEMWAL_PRIVATE_KEY=<delegate-private-key-hex>
MEMWAL_ACCOUNT_ID=0x<memwal-account-object-id>
MEMWAL_REGISTRY_ID=0x<account-registry-object-id>
```

The `removeDelegateKey` call in the revoke flow reads `MEMWAL_REGISTRY_ID`. The `getMemWal()` client in step 3 passes only `key`, `accountId`, and `serverUrl` to `MemWal.create()`.

### How to revoke a compromised delegate key

If a delegate key is compromised, revoke it from the [dashboard](https://memory.walrus.xyz), or programmatically with the **owner** credentials:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/cookbook-multi-tenant.md" target="_blank" className="code-source-link">Source: sdk/cookbook-multi-tenant.md</a>

```ts
import { removeDelegateKey } from "@mysten-incubation/memwal/account";

await removeDelegateKey({
  packageId: "0x<contract-package-id>",
  registryId: process.env.MEMWAL_REGISTRY_ID!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  publicKey: "<delegate-public-key-hex>", // the leaked key's public key
  suiPrivateKey: "suiprivkey1...",        // owner key: kept offline, NOT on the server
  suiNetwork: "mainnet",                 // use testnet for a testnet account
});
```

Then generate a fresh delegate key, register it with `addDelegateKey`, and rotate `MEMWAL_PRIVATE_KEY`. See the full lifecycle in [Delegate Key Management](/walrus-memory/contract/delegate-key-management).

## 2. How to name namespaces for multi-user apps

Derive a deterministic namespace from the authenticated wallet address. Normalize it so the same wallet always maps to the same namespace:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/cookbook-multi-tenant.md" target="_blank" className="code-source-link">Source: sdk/cookbook-multi-tenant.md</a>

```ts
// lib/memory/namespace.ts
export function userNamespace(walletAddress: string): string {
  return `myapp-${walletAddress.toLowerCase()}`;
}
```

Guidelines:

- **Prefix with your app name** (`myapp-…`) so multiple apps can share one account without colliding.
- **Lowercase the address.** Namespaces are matched exactly, with no prefix or hierarchy, so `0xAB…` and `0xab…` are different buckets.
- **Keep it stable.** Never include a timestamp or session ID, or you lose the user's history on the next request.

:::warning
A namespace serves as a **data-organization boundary, not a security boundary between users.** The delegate key can read and write **every** namespace under the account. Cross-user isolation depends entirely on your server mapping each authenticated wallet to the correct namespace. Verify the wallet signature **before** choosing the namespace. Never take the namespace (or raw address) from an unauthenticated request body.
:::

## 3. How to use the client in Next.js and serverless apps

Create one client per request (or memoize per warm Lambda) and pass the per-user namespace into each call.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/cookbook-multi-tenant.md" target="_blank" className="code-source-link">Source: sdk/cookbook-multi-tenant.md</a>

```ts
// lib/memory/client.ts
import { MemWal } from "@mysten-incubation/memwal";

export function getMemWal() {
  return MemWal.create({
    key: process.env.MEMWAL_PRIVATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl: "https://relayer.memory.walrus.xyz",
  });
}
```

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/cookbook-multi-tenant.md" target="_blank" className="code-source-link">Source: sdk/cookbook-multi-tenant.md</a>

```ts
// app/api/chat/route.ts  (Next.js App Router)
import { getMemWal } from "@/lib/memory/client";
import { userNamespace } from "@/lib/memory/namespace";
import { verifyWalletAuth } from "@/lib/auth"; // your wallet-signature check

export async function POST(req: Request) {
  // 1. Authenticate the user from a signed message, NOT from a raw address field.
  const session = await verifyWalletAuth(req);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const ns = userNamespace(session.walletAddress);
  const { message } = await req.json();
  const memwal = getMemWal();

  // 2. Load relevant memory for this user.
  const recalled = await memwal.recall({
    query: message,
    namespace: ns,
    limit: 5,
  });

  // 3. Generate a reply with your model, injecting recalled.results as context…
  const reply = await generateReply(message, recalled.results);

  // 4. Submit new memory and return after the relayer accepts the job.
  //    Capture the job ID for a background worker to track completion.
  //    Use rememberAndWait only when the caller needs completion before proceeding.
  const accepted = await memwal.remember(`User said: ${message}`, ns);

  return Response.json({ reply, recalled: recalled.results, memoryJobId: accepted.job_id });
}
```

`remember` waits for acceptance, not for the upload and indexing to finish. Persist the returned job ID if completion must survive a process restart. For retries, stable operation keys, and checking completion outside the chat turn, see [Production readiness](/walrus-memory/sdk/production-readiness).

:::note
**Structured agent state (a single profile JSON):** semantic `recall` is built for fuzzy retrieval by meaning, so it is not a reliable way to fetch one authoritative "current profile" record. If you need deterministic key-based reads/upserts, follow [issue #247](https://github.com/MystenLabs/MemWal/issues/247). For now, prefer a **dedicated namespace per structured record** and treat free-form semantic lines separately.
:::


### Keep the delegate key server-side only

`MEMWAL_PRIVATE_KEY` must live in server env vars. Never ship it to the browser, a client component, or `NEXT_PUBLIC_*`. Any code path that reaches the client must not import the memory client.

### Use the wallet for identity, not authorization

The user's wallet signature proves who they are. It does not grant memory access; your delegate key does. Verify the signature server-side and derive the namespace from the verified address.

### Never trust a client-supplied namespace

Compute the namespace on the server from the authenticated address. If a client could send its own namespace, any user could read another user's bucket.

### Keep the owner key offline

The owner wallet (used for `createAccount` / `addDelegateKey` / `removeDelegateKey`) should never run on the server. Run those operations from a local machine or a secure admin tool.


## 4. How to prove onchain storage for demos and submissions

Your `MemWalAccount` is a regular Sui object. Share its object ID and view it on a Sui explorer (for example, [Suiscan](https://suiscan.xyz) or [SuiVision](https://suivision.xyz)) to prove memory is really onchain, not just in a local cache. Pair it with a live `health()` check (see the [API Reference](/walrus-memory/sdk/api-reference)) so judges can confirm the relayer is reachable.

## See also

- [Quick Start](/walrus-memory/sdk/quick-start): install and store your first memory
- [Delegate Key Management](/walrus-memory/contract/delegate-key-management): full key lifecycle
- [Ownership and Access](/walrus-memory/fundamentals/concepts/ownership-and-access): the trust model behind accounts and delegates
- [API Reference](/walrus-memory/sdk/api-reference): full method signatures

## Which key formats do the revoke call and the client take?

The revoke call and the memory client take 2 different keys:

- **`suiPrivateKey` in `removeDelegateKey`:** The owner's Sui signer key in `suiprivkey1...` format. You can pass a `walletSigner` instead, so the owner key never has to exist as a string.
- **`key` in `MemWal.create()`:** The delegate private key in hex, which you store in `MEMWAL_PRIVATE_KEY`.

Never put the owner key in `MEMWAL_PRIVATE_KEY`.

## How do you implement `verifyWalletAuth`?

The Walrus Memory example apps implement this check with a server-issued challenge:

1. The server issues a single-use challenge message for the wallet address.
2. The user signs the message with the wallet and returns the challenge ID and the signature.
3. The server verifies the signature against the challenge and that address with `verifyPersonalMessageSignature` from `@mysten/sui/verify`.
4. The server consumes the challenge before it creates a session, so nobody can replay a captured signature.

Return the verified address as `session.walletAddress` and derive the namespace only from that value.
