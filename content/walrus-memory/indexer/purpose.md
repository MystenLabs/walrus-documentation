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
2. Polls Sui blockchain events using `suix_queryEvents`
3. Filters for `AccountCreated` events from the Walrus Memory package
4. Inserts `account_id → owner` mappings into the `accounts` table
5. Stores its event cursor in `indexer_state` so it can resume after restarts

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
| `SUI_RPC_URL` | No | Mainnet fullnode | Sui RPC endpoint |
| `POLL_INTERVAL_SECS` | No | `5` | Seconds between event poll cycles |

## Running

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/indexer/purpose.md" target="_blank" className="code-source-link">Source: indexer/purpose.md</a>

```bash
$ cd services/indexer
$ cargo run
```

The indexer is recommended for production but optional for development. If the indexer stops or falls behind, the `accounts` table lags onchain state, so the existence check and owner-token lookup that read it will not see recently created accounts until it catches up; delegate-key auth resolution is unaffected, because the indexed `accounts` table is not part of that chain (a cold key still needs a signed `x-account-id` or `MEMWAL_ACCOUNT_ID`, otherwise it gets a `401`).

## Which routes read the accounts table?

Three places in the relayer read the `accounts` table, and all of them use the same `db.find_account_by_owner` helper:

- `GET /api/accounts/{owner}/exists`: A public, unauthenticated endpoint that returns `{ "exists": bool }`. It checks registry presence only, not onchain `active` status. The indexer only decodes `AccountCreated` events, so it never removes or updates a row after an account is deactivated.
- `POST /v1/owner-tokens`: Rejects the request with `400` when the owner has no indexed account, instead of minting a token for a nonexistent account.
- Owner-token reads on `/v1/owners/{owner}/{namespaces,memories,agents}`: The read API's auth middleware, `auth::verify_read_api_auth`, resolves the token's owner to an account through the table and returns `401` when the account no longer resolves.

None of them takes part in delegate-key resolution for signed requests. Because the table never records deactivation, owner-token issuance and owner-token reads both verify onchain that the account is still `active`. The existence endpoint does not.

## When the owner-token flow checks the accounts table

`POST /v1/owner-tokens` runs its gates in this order: address format validation, configuration check, per-owner rate limit, account lookup in the `accounts` table, an onchain check that the account is still active, and then mint. The table lookup comes after the cheaper gates because it costs a database round trip, so only requests that clear them reach the `accounts` table. The relayer lowercases the owner address before the lookup, because the indexer always stores the `accounts.owner` column as lowercase hex.

The onchain check covers what the table cannot show:

- If the account has been deactivated, the relayer returns `403` with `MemWalAccount has been deactivated`.
- If the account object is not found onchain or belongs to a different owner, the relayer returns `400` with `owner has no MemWalAccount`.
- If the onchain verification itself fails, the relayer returns `503` instead of minting.

Owner-token reads run the same active check, so a token minted before deactivation stops working once the account is deactivated, even before the token expires.

## What happens before an account is indexed

Until the indexer inserts a row for a newly created account, the relayer treats the owner as having no account. The lookup resolves to no account, so `GET /api/accounts/{owner}/exists` reports that the owner has no account, and `POST /v1/owner-tokens` fails with `400` and the message `owner has no MemWalAccount`. Both routes return the account after the indexer observes the `AccountCreated` event and inserts the row.
