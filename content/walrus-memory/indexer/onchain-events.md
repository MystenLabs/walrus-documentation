---
title: "Onchain Events"
description: >-
  The Sui events emitted by the Walrus Memory smart contract and how the indexer
  uses them to update local backend state, including current coverage details.
keywords:
  - Walrus Memory
  - onchain events
  - Sui events
  - indexer
  - smart contract
  - AccountCreated
  - DelegateKeyAdded
  - DelegateKeyRemoved
  - AccountDeactivated
  - AccountReactivated
  - AccountQuarantined
goal:
  description: List the onchain events emitted by the Walrus Memory contract, identify which ones the indexer currently processes, and understand the gap for events not yet covered.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 100
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - "What onchain events does the Walrus Memory contract emit?"
  - "Which Sui events does the Walrus Memory indexer listen to?"
  - "What fields are included in the AccountCreated event?"
answer: >-
  The Walrus Memory contract emits AccountCreated, DelegateKeyAdded, DelegateKeyRemoved,
  AccountDeactivated, and AccountReactivated events. The indexer currently targets the
  AccountCreated event flow as its primary sync path; delegate key and activation events
  may be indexed in future iterations.
---

The indexer listens to Sui events emitted by the Walrus Memory contract and uses them to update local backend state.

## Events

The Walrus Memory contract emits the following events:

| Event | Emitted when | Fields |
|-------|-------------|--------|
| `AccountCreated` | A new account is created | `account_id`, `owner` |
| `DelegateKeyAdded` | A delegate key is added | `account_id`, `public_key`, `sui_address`, `label` |
| `DelegateKeyRemoved` | A delegate key is removed | `account_id`, `public_key` |
| `AccountDeactivated` | An account is frozen | `account_id`, `owner` |
| `AccountReactivated` | A frozen account is unfrozen | `account_id`, `owner` |
| `AccountQuarantined` | Admin containment is applied | `account_id`, `owner` |
| `AccountQuarantineCleared` | Admin containment is released | `account_id`, `owner` |

## Current coverage

The indexer currently targets the `AccountCreated` event flow as its primary sync path. Delegate key events and account activation events are part of the broader design and might be indexed in future iterations.

## Account freeze and quarantine states

Owner deactivation and Admin quarantine use separate flags on the account. `AccountDeactivated` reports that the `active` flag changed to false. Two calls emit it:

- The owner calls `deactivate_account`. The call aborts if the account is already deactivated.
- An AdminCap holder calls `admin_deactivate_account`. This sets the `admin_quarantined` flag and emits `AccountQuarantined`. It also emits `AccountDeactivated`, but only if the account was still active.

While quarantine is active, the owner cannot reactivate the account. `admin_clear_quarantine` releases quarantine without reactivating the account. The account stays frozen until the owner calls `reactivate_account`.

## How the indexer uses `AccountCreated`

The indexer polls Sui events using `suix_queryEvents` and filters for `AccountCreated` events from the Walrus Memory package. For each event, it inserts an `account_id → owner` mapping into the `accounts` table. The relayer uses this same PostgreSQL database, so it can resolve accounts quickly. The indexer stores its event cursor in `indexer_state`, which lets it resume after restarts.
