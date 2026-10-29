---
title: "Purpose"
description: >-
  Why the Walrus Memory indexer exists, how it eliminates expensive onchain RPC calls
  by syncing account data to PostgreSQL, and the auth resolution priority flow.
keywords:
  - Walrus Memory
  - Walrus Memory
  - indexer
  - purpose
  - auth resolution
  - PostgreSQL
goal:
  description: Explain why the indexer exists, describe how it syncs account data to PostgreSQL so the relayer can resolve accounts without onchain RPC calls, and trace the auth resolution priority chain the relayer uses for signed requests.
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
  - "Why does Walrus Memory need an indexer?"
  - "How does the Walrus Memory relayer resolve delegate key ownership?"
  - "How do I configure and run the Walrus Memory indexer?"
answer: >-
  The indexer listens to Sui events and records which owner has an account.
  Delegate-key authentication does not scan AccountRegistry. A cold key needs
  x-account-id or MEMWAL_ACCOUNT_ID. A key already cached resolves without either.
---

The indexer keeps the backend in sync with onchain state so the relayer can serve the account existence check and owner-token lookup from PostgreSQL instead of onchain RPC calls. It does not feed delegate-key auth resolution, which follows a separate priority chain.

## Why it exists

Delegate-key authentication does not walk `AccountRegistry`. A cold key is verified against the signed `x-account-id`, or against `MEMWAL_ACCOUNT_ID` when that env is set. The indexer is what fills the `accounts` table the existence check and owner-token lookup read.

## How it works

The indexer is a standalone Rust service (`services/indexer`) that:

1. Connects to the same PostgreSQL database as the relayer
2. Reads Sui checkpoints from a remote checkpoint store through the Sui checkpoint-ingestion framework
3. Filters for `AccountCreated` events from the Walrus Memory package
4. Inserts `account_id → owner` mappings into the `accounts` table
5. Records its checkpoint watermark through the framework so it can resume after restarts

## Auth resolution flow

When the relayer receives a signed request, it resolves the delegate key's account in this order:

1. **PostgreSQL cache** (`delegate_key_cache`), populated after a successful resolution
2. **Signed `x-account-id`**, or **`MEMWAL_ACCOUNT_ID`** when the header is absent, one account object, not a registry walk
3. Otherwise **`401`**. A cold key with no account id is not looked up onchain

After a successful resolution, the mapping is cached in `delegate_key_cache`. The indexed `accounts` table is not part of this chain; the indexer fills it for the existence check and owner-token lookup instead.

## Configuration

The indexer reads these environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | | PostgreSQL connection string |
| `MEMWAL_PACKAGE_ID` | Yes | | Walrus Memory contract package ID to filter events |

It also takes two command-line flags:

| Flag | Description |
|------|-------------|
| `--remote-store-url` | URL of the remote checkpoint store to read checkpoints from |
| `--first-checkpoint` | Checkpoint to start from. Use one at or before the checkpoint that published your Walrus Memory package, so the indexer sees every `AccountCreated` event. |

## Running

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/indexer/purpose.md" target="_blank" className="code-source-link">Source: indexer/purpose.md</a>

```bash
$ cd services/indexer
$ cargo run --release -- --remote-store-url <CHECKPOINT_STORE_URL> --first-checkpoint <CHECKPOINT>
```

The indexer is recommended for production but optional for development. If the indexer stops or falls behind, the `accounts` table lags onchain state, so the existence check and owner-token lookup that read it will not see recently created accounts until it catches up; delegate-key auth resolution is unaffected, because the indexed `accounts` table is not part of that chain (a cold key still needs a signed `x-account-id` or `MEMWAL_ACCOUNT_ID`, otherwise it gets a `401`).
