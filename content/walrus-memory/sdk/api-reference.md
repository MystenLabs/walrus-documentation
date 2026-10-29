---
title: "API Reference"
description: >-
  Complete API reference for the Walrus Memory SDK, including method signatures, config fields, and return types for Walrus Memory, MemWalManual, withMemWal, account management, and utility functions.
keywords:
  - Walrus Memory
  - Walrus Memory
  - API reference
  - method signatures
  - SDK methods
  - config
goal:
  description: Look up the exact method signature, parameter types, return type, and thrown errors for any Walrus Memory SDK method or config field before writing code that calls it.
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
  - What are the method signatures for the Walrus Memory SDK?
  - What config options does Walrus Memory.create accept?
  - What does the recall method return in Walrus Memory?
answer: >-
  The Walrus Memory SDK API includes Walrus Memory (remember, recall, analyze, restore, health, rememberBulk, and more), MemWalManual (rememberManual, recallManual, restore), withMemWal (AI SDK middleware), account management utilities (createAccount, addDelegateKey, removeDelegateKey, generateDelegateKey), and utility functions for delegate key operations.
---

The Walrus Memory SDK exposes the `MemWal` client, `MemWalManual`, `withMemWal`, account management functions, and utility functions. Each section gives the method signature, config fields, and return types.

Walrus stores each memory as a Seal-encrypted blob, and the `blob_id` field in results identifies that blob.

See also:

- [Configuration](/walrus-memory/reference/configuration)
- [Relayer API](/walrus-memory/relayer/api-reference)

## `MemWal.create(config)`

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
MemWal.create(config: MemWalConfig): MemWal
```

Config:

| Property | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `key` | `string \| Uint8Array` | Yes | | Delegate private key: hex (optionally `0x`-prefixed), `suiprivkey1...`, or `Uint8Array` |
| `accountId` | `string` | Yes | | MemWalAccount object ID on Sui |
| `serverUrl` | `string` | No | `https://relayer.memory.walrus.xyz` | Relayer URL |
| `namespace` | `string` | No | `"default"` | Default namespace for memory isolation |
| `requestTimeoutMs` | `number` | No | `30000` | Deadline for one relayer request. A non-positive or non-finite value falls back to `30000`. `restore` and `analyze` use their own 60s deadlines |
| `recallTimeoutMs` | `number` | No | `15000` | Deadline for the `/api/recall` request. Per-call `RecallOptions.timeoutMs` overrides it |
| `preflightTimeoutMs` | `number` | No | `5000` | Deadline for each preflight round-trip (`GET /version`, `GET /health`, `GET /config`) |

For the full config surface, see [Configuration](/walrus-memory/reference/configuration).

`recallTimeoutMs` covers the recall request alone. The preflights that run
before it (the relayer compatibility check and the Seal session build) are
bounded separately by `preflightTimeoutMs`, so a slow relayer preflight cannot
consume recall's budget.


### `remember(text, namespace?): Promise<RememberAcceptedResult>`

Submit one memory through the relayer. The method returns after the relayer creates a background job; embedding, Seal encryption, Walrus upload, and vector indexing continue asynchronously.

HTTP 426 throws `MemWalCompatibilityError`.

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  job_id: string; // Polling id
  status: string; // Usually "running"
}
```

### `rememberAndWait(text, namespace?, opts?): Promise<RememberResult>`

Submit one memory and poll until the background job completes.

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  id: string;        // Stable job id/vector row id
  job_id: string;    // Polling id
  blob_id: string;   // Walrus blob ID
  owner: string;     // Owner Sui address
  namespace: string; // Namespace used
}
```

### `getRememberStatus(jobId): Promise<RememberJobStatus>`

One `GET /api/remember/{jobId}`. Accepts 200 and 404 and returns the job state (`pending`, `running`, `uploaded`, `done`, `failed`, `not_found`) without polling. A job id that is empty or contains whitespace, `/`, `?`, or `#` is `not_found` and is not requested.

### `waitForRememberJob(jobId, opts?): Promise<RememberResult>`

Poll a previously accepted remember job until it reaches `done` or `failed`. A job id outside `[A-Za-z0-9_-]+`, or one the relayer has no record of, throws `MemWalRememberJobNotFoundError` (`status` 404). A `failed` job throws `MemWalRememberJobFailedError` (`status` 500). HTTP 429/5xx status reads are retried rather than thrown; a deadline with no terminal status, including one where every read was 429, throws `MemWalRememberJobTimeoutError` (`status` 504, default `timeoutMs` 60\_000). These classes, plus `MemWalRateLimitedError` (see `waitForRememberJobs` below), are exported from the SDK entry and `instanceof`-checkable, alongside the existing `MemWalCompatibilityError`.

### `rememberBulk(items): Promise<RememberBulkAcceptedResult>`

Submit up to 20 memories in one request and return the accepted job IDs immediately.

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  job_ids: string[];
  total: number;
  status: string; // Usually "running"
}
```

### `rememberBulkAndWait(items, opts?): Promise<RememberBulkResult>`

Submit a bulk remember request and wait until every job reaches a terminal state. Unlike `waitForRememberJob`, a failed or non-terminal job is reported per-item in the result rather than thrown. The one case this (and `waitForRememberJobs`) still throws is `MemWalRateLimitedError` (`status` 429): every status read was rate-limited, including a final confirming read after the deadline, so none of the batch's writes could be confirmed.

### `recall(params): Promise<RecallResult>`

Search for memories matching a natural language query, scoped to `owner + namespace`.

- Preferred form: `recall({ query, limit?, topK?, namespace?, maxDistance?, sort?, scoringWeights? })`
- `limit` defaults to `10` (relayer caps at `100`); `topK` is an alias and wins when both are set
- Legacy positional forms still work: `recall(query)`, `recall(query, limit)`, `recall(query, limit, namespace)`, and `recall(query, options)`. `recall(query, namespace)` throws `TypeError`; namespace is not a valid second argument.
- `maxDistance` filters weak matches client-side by dropping results where `distance >= maxDistance`
- `sort` picks the ordering: `"relevance"` (default) or `"recent"` for newest-among-matches
- `scoringWeights` blends recency and importance into the ranking (see [Ordering](#ordering) below)
- `timeoutMs` overrides the client's `recallTimeoutMs` for this call. `0` disables the deadline. On expiry
  recall throws `MemWalRequestTimeout` (status 504). `isTimeoutError(err)` is true for that error
  and for a preflight `TimeoutError` whose `phase` names the stalled round-trip.

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  results: Array<{
    blob_id: string;     // Walrus blob ID
    text: string;        // Decrypted plaintext
    distance: number;    // Cosine distance (lower = more similar)
    created_at?: string; // RFC3339 write-time; absent on older relayers
  }>;
  total: number;
}
```

`distance` is cosine distance. Lower is more similar.

MCP `memwal_recall` displays `score = 1 - distance` (higher = more similar). Do not apply an SDK `maxDistance` threshold to those scores. The polarities are inverted.

`created_at` is when the fact was **written**, not any date its text describes.

#### Ordering

**By default, results are ranked by semantic relevance only. There is no
recency guarantee: not within the returned set, and not in which records make
the set at all.**

That second part is the one that bites. Ranking happens server-side, before
`limit` truncates, so a newest-wins protocol written like this is broken:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
// WRONG: the newest record may never have been in `results`.
const { results } = await memwal.recall({ query: "current task", limit: 3 });
const newest = results.sort(byCreatedAtDesc)[0];
```

If an older record echoes the query's wording more literally than the newest
one does, the older record outranks it and the newest falls outside the window
entirely. Sorting client-side cannot recover a record the server never returned.

Ask the relayer for a recency ordering instead, with `sort: "recent"`:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
// The relayer widens the candidate set first, then orders by write-time.
const { results } = await memwal.recall({
  query: "current task",
  limit: 3,
  sort: "recent",
});
const newest = results[0];
```

#### `sort`

`sort` decides how the relayer orders results, and how many candidates it
considers in the first place.

| Value | Behavior |
| --- | --- |
| `"relevance"` | Semantic similarity only, the cosine order. The default. |
| `"recent"` | Newest among the semantic matches. |

`"recent"` over-fetches. It asks for `limit * 5` candidates, caps that at 50,
and never goes below `limit`. It then orders those candidates by `created_at`
descending and truncates to `limit`. Records sharing a timestamp fall back to
the closer semantic match.

Semantic similarity generates the candidates and write-time picks the winners,
so a newest record worded less literally than an older one still comes first.
That is the part `scoringWeights` cannot do: weights reorder the rows the
search already returned, and `sort` changes which rows those are.

Selection runs before the Walrus download and Seal decrypt, so the wider net
costs one broader SQL query rather than five times the decrypt work.

Two limits worth knowing:

- `"recent"` returns the newest record among the candidates, not the newest
  record overall. The candidate set is still the cosine top-N, so in a large
  namespace a newer record can rank below the cutoff and stay out.
- `maxDistance` filters client-side, after the relayer selects. Pairing it
  with `"recent"` can drop the loosely-worded newest record that `"recent"`
  exists to surface.

Omitting `sort` leaves the request byte-identical to a plain cosine recall, so
existing callers see no change.

An explicit `sort`, `"relevance"` included, is the order: the relayer ignores
`scoringWeights` for that request. Weights re-rank only when `sort` is omitted.

#### `scoringWeights`

`scoringWeights` blends recency and importance into the relayer's ranking:

| Weight | Default | Effect |
| --- | --- | --- |
| `semantic` | `1` | Weight on similarity (`1 - distance`) |
| `recency` | `0` | Weight on write-time decay |
| `recencyHalfLifeDays` | `30` | Days for the recency term to halve |
| `importance` | `0` | Weight on the per-fact importance set at extraction time |

**It re-ranks the candidates the vector search already returned. It does not
widen the search.** The relayer selects the cosine top-`limit` first and the
ranker reorders only those, so weighting alone does not solve the problem
above; `sort: "recent"` does. It also has to overcome the semantic gap to reorder anything: at the
default 30-day half-life, two records a few days apart barely differ on the
recency term, so a closer-worded older record still wins. Shorten
`recencyHalfLifeDays` to make the recency term bite.

Omitting `scoringWeights` leaves the request byte-identical to a plain cosine
sort, so existing callers are unaffected.

Use `sort: "recent"` when you need the newest match. Use `scoringWeights` to
bias an order without changing which records qualify. Use `created_at` to
verify or display whatever order comes back.

### `analyze(text, namespace?): Promise<AnalyzeResult>`

Extract memorable facts from text using an LLM, then return accepted background jobs for storing each fact.

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  job_ids: string[];
  facts: Array<{
    text: string;     // Extracted fact
    id: string;       // Same value as job_id
    job_id: string;   // Polling id
  }>;
  fact_count: number;
  status: string;     // Usually "pending"
  owner: string;
}
```

Use `analyzeAndWait(text, namespace?, opts?)` to wait for every extracted fact job to finish and return per-job storage results.

### `restore(namespace, limit?): Promise<RestoreResult>`

Rebuild missing indexed entries for one namespace from Walrus. Incremental, only re-indexes blobs that aren't already in the local database.

- `limit` defaults to `10` (relayer clamps to `[1, 100]`)

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  restored: number;   // Entries newly indexed
  skipped: number;    // On-chain blobs already in the local success index
  failed: number;     // Permanent decrypt/UTF-8 failures (defaults to 0)
  total: number;      // Total blobs found on-chain
  namespace: string;
  owner: string;
}
```

### `listNamespaces(options?): Promise<NamespacesResult>`

List the namespaces this account holds memories in. Returns metadata only, with no blob fetch or decryption.

Recall is similarity-ranked and needs a namespace to search, so an agent connecting to an unfamiliar account would otherwise have to guess names or fall back to `"default"`.

- `options.cursor`: The previous page's `next_cursor`, to continue a walk or poll incrementally
- `options.limit`: Page size; the relayer defaults to `100` and clamps to `500`

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  namespaces: Array<{
    id: string;
    name: string;
    memory_count: number;
    storage_used: number;   // bytes
    updated_at: string;     // MAX(updated_at) across the namespace
  }>;
  next_cursor: string | null;
  has_more: boolean;
  snapshot_version: number;
}
```

Paginate on `has_more`, not on page length. The relayer clamps `limit`, so a caller asking for more than the cap gets exactly the cap back and would wrongly conclude it was done.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
let cursor: string | undefined;
let more = true;
while (more) {
  const page = await memwal.listNamespaces({ cursor });
  for (const ns of page.namespaces) console.log(ns.name, ns.memory_count);
  cursor = page.next_cursor ?? undefined;
  more = page.has_more;
}
```

### `listMemories(options?): Promise<MemoriesResult>`

List the memories this account holds, without a semantic query. Use it to confirm a write landed, count a namespace exactly, or find a bulk write that went to the wrong namespace. Returns metadata only, with no blob fetch or decryption; use `recall()` for content.

- `options.cursor`: The previous page's `next_cursor`, to continue a walk or poll incrementally
- `options.limit`: Page size, counted before the `namespace` filter; the relayer defaults to `100` and clamps to `500`
- `options.namespace`: Keep only this namespace. Filtered client-side, so a page can be short or empty while `has_more` is still `true`

**Returns:**

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
{
  memories: Array<{
    memory_id: string;
    namespace_id: string;   // the namespace name
    blob_id: string;
    created_at: string;
    updated_at: string;
    size: number;           // encrypted bytes
    agent_id: string | null;
    package_id: string | null;
    status: string;
    end_epoch: number | null;
    expires_at: string | null;
    importance: number | null;
  }>;
  next_cursor: string | null;
  has_more: boolean;
  snapshot_version: number;
  deleted: Array<{ memory_id: string; namespace_id: string; deleted_at: string }>;
  must_resync: boolean;     // cursor too old: restart without one
}
```

Paginate on `has_more`, not on page length:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
let cursor: string | undefined;
let more = true;
let count = 0;
while (more) {
  const page = await memwal.listMemories({ cursor, namespace: "work" });
  count += page.memories.length;
  cursor = page.next_cursor ?? undefined;
  more = page.has_more;
}
```

### `health(): Promise<HealthResult>`

Check relayer health. Does not require authentication, a successful response confirms the relayer is reachable, not that your `key`/`accountId` are valid. A signed call (for example, `remember()`, `recall()`) can still fail with `401` immediately after a passing `health()`.

**Returns:** `{ status: string, version: string, relayerVersion?: string, apiVersion?: string, minSupportedSdk?: ... }`

### `compatibility(): Promise<RelayerVersionMetadata>`

Fetch and validate the relayer compatibility contract from `/version`. Protected SDK calls run this check before signing the first request and raise `MemWalCompatibilityError` when the SDK/relayer pair is unsupported.

### `getPublicKeyHex(): Promise<string>`

Return the hex-encoded public key for the current delegate key.

### Which lower-level methods does `MemWal` expose?

These exist on the `MemWal` class for advanced use cases:

| Method | Description |
|--------|-------------|
| `rememberManual({ encryptedData, vector, namespace? })` | Send Seal-encrypted bytes + a pre-computed vector; the relayer uploads to Walrus |
| `recallManual({ vector, limit?, namespace? })` | Search with a pre-computed query vector. Returns `RecallManualHitResult`: blob IDs and distances, no decrypted text |
| `embed(text)` | Generate an embedding vector for text (no storage) |

## `MemWalManual`

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
import { MemWalManual } from "@mysten-incubation/memwal/manual";
```

See [MemWalManual usage](/walrus-memory/sdk/usage/memwal-manual) for the full setup and flow details.

### `rememberManual(text, namespace?): Promise<RememberManualResult>`

Embed locally, Seal encrypt locally, send encrypted payload + vector to relayer for Walrus upload and vector registration.

### `recallManual(query, limit?, namespace?): Promise<RecallManualMemoryResult>`

Embed locally, search through relayer, download from Walrus, Seal decrypt locally. Returns decrypted text results. This is not the hit-only `RecallManualHitResult` returned by `MemWal.recallManual()`.

- `recallManual(query, { limit?, namespace?, scoringWeights? })` is valid
- `recallManual(query, namespace)` throws `TypeError`; namespace is not a valid second argument

### `restore(namespace, limit?): Promise<RestoreResult>`

Same as `MemWal.restore()`, delegates to the relayer.

### `isWalletMode: boolean`

Whether this client uses a connected wallet signer (vs. raw keypair).

### How to configure `MemWalManual`

- `suiNetwork` defaults to `mainnet`
- `sealServerConfigs` lets the client configure independent or committee Seal servers; committee entries require `aggregatorUrl`
- `sealKeyServers` remains supported as a legacy independent key server object ID override
- All `@mysten/*` peer dependencies are loaded dynamically, only needed if you use `MemWalManual`

## `withMemWal`

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
import { withMemWal } from "@mysten-incubation/memwal/ai";
```

Wraps a Vercel AI SDK model with automatic memory recall and save.

**Before generation:**
- Reads the last user message
- Runs `recall()` against Walrus Memory
- Filters by minimum relevance (`minRelevance`, default `0.3`)
- Injects matching memories into the prompt as a system message

**After generation:**
- Optionally runs `analyze()` on the user message (fire-and-forget)
- Saves extracted facts asynchronously

**Options** (extends `MemWalConfig`):

| Option | Default | Description |
|--------|---------|-------------|
| `maxMemories` | `5` | Max memories to inject per request |
| `autoSave` | `true` | Auto-save new facts from conversation |
| `minRelevance` | `0.3` | Minimum similarity score (0–1) to include a memory |
| `debug` | `false` | Enable debug logging |

See [Configuration](/walrus-memory/reference/configuration) for all options.

## How to manage accounts and delegate keys

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
import {
  createAccount,
  addDelegateKey,
  removeDelegateKey,
  generateDelegateKey,
} from "@mysten-incubation/memwal/account";
```

| Function | Description |
|----------|-------------|
| `generateDelegateKey()` | Generate a new Ed25519 keypair (returns `privateKey`, `publicKey`, `suiAddress`) |
| `createAccount(opts)` | Create a new MemWalAccount onchain (one per Sui address) |
| `addDelegateKey(opts)` | Add a delegate key to an account (owner only) |
| `removeDelegateKey(opts)` | Remove a delegate key from an account (owner only) |

`addDelegateKey` and `removeDelegateKey` require the shared `registryId` alongside the package and account IDs.

## Utility functions

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md" target="_blank" className="code-source-link">Source: sdk/api-reference.md</a>

```ts
import { delegateKeyToSuiAddress, delegateKeyToPublicKey } from "@mysten-incubation/memwal";
```

| Function | Description |
|----------|-------------|
| `delegateKeyToSuiAddress(privateKeyHex)` | Derive the Sui address from a delegate private key |
| `delegateKeyToPublicKey(privateKeyHex)` | Get the 32-byte public key from a delegate private key |

## Remember job ID validation

`getRememberStatus` and `waitForRememberJob` share one validity rule: a job ID must match `[A-Za-z0-9_-]+`. Both methods reject any other ID before signing, so the SDK never sends the request. This rule covers `.`, `..`, `\`, and `%2e%2e`, not only whitespace, `/`, `?`, and `#`. Valid UUID job IDs pass unchanged. For an empty ID, `getRememberStatus` returns `not_found` without a request, and `waitForRememberJob` fails immediately with status 404.

## Account management options

Each account function takes one options object. The `@mysten-incubation/memwal/account` entry exports the types `CreateAccountOpts`, `CreateAccountResult`, `AddDelegateKeyOpts`, `AddDelegateKeyResult`, and `RemoveDelegateKeyOpts`.

- `createAccount`: `packageId`, `registryId`, and a signer. The result includes `accountId`.
- `addDelegateKey`: `packageId`, `registryId`, `accountId`, `publicKey`, `label`, and a signer.
- `removeDelegateKey`: `packageId`, `registryId`, `accountId`, `publicKey`, and a signer.

For the signer, pass `walletSigner` for browser wallet signing or `suiPrivateKey` (a `suiprivkey1...` owner key) for server-side signing. `suiNetwork` selects the network, for example `mainnet` or `testnet`. Without `suiClient`, the functions default to `SuiGrpcClient` against the public fullnode for `suiNetwork`. An explicit `suiClient` takes precedence.

## Manual method types

`rememberManual(opts: RememberManualOptions)` resolves to `RememberManualResult`, which contains `id`, `blob_id`, `owner`, and `namespace`. Pass these fields:

- `encryptedData`: Base64-encoded Seal-encrypted bytes. The SDK rejects an empty value.
- `vector`: An embedding vector you already generated (for example, 1536-dim). The SDK rejects non-finite values.
- `namespace`: Optional. Defaults to the client namespace.

The delegate private key stays on the client for this request.

On `MemWal`, `recallManual` returns `RecallManualHitResult`, which holds a blob ID and distance for each hit and no text. `MemWalManual.recallManual` returns `RecallManualMemoryResult`, which holds decrypted text. `RecallManualResult` is a deprecated alias of those two types.
