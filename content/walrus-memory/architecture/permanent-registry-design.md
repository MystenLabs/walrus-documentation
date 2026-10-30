---
title: "Permanent Registry Design"
description: >-
  Design rationale for the permanent append-only AccountRegistry in Walrus Memory,
  explaining why the registry never removes account entries: to prevent Sybil attacks,
  ensure deterministic indexing, and maintain SEAL access integrity.
keywords:
  - Walrus Memory
  - Walrus Memory
  - AccountRegistry
  - permanent registry
  - architecture
  - SEAL
goal:
  description: Explain why the AccountRegistry is append-only, predict what breaks if entries were mutable, and apply this constraint when designing account and key lifecycle flows.
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
  - "Why is the Walrus Memory AccountRegistry permanent and append-only?"
  - "What happens when a Walrus Memory account is deactivated?"
  - "How does the permanent registry prevent Sybil attacks in Walrus Memory?"
answer: >-
  The AccountRegistry is a permanent append-only mapping so that each address can only
  create one MemWalAccount. Walrus Memory treats account deletion as deactivation rather than
  erasure, preventing duplicate Sybil accounts, preserving deterministic indexing for
  offchain systems, and ensuring SEAL encryption identity maps to a single stable
  onchain policy object.
---

## Permanent registry design intent

The `AccountRegistry` shared object in Walrus Memory is a permanent append-only mapping of `owner_address -> account_id`. Even if you deactivate or delete your account, your address remains in the registry, because deletion is treated as deactivation (freezing) rather than true erasure.

## Security and architecture rationale
1. **Preventing duplicate Sybil accounts:**
   By maintaining a permanent record, the registry ensures that an address can only ever create exactly one MemWalAccount. This simplifies offchain indexing and prevents abuses related to account recreation.
   
2. **Deterministic indexing:**
   Indexers rely on a strict 1:1 mapping between your wallet address and your Walrus Memory storage container. If you could delete an account and recreate it with a different ID, offchain historical data queries and relational integrity would break.

3. **Data immutability context:**
   In Web3, identity is persistent. Walrus Memory treats the deletion of an account as a deactivation (freezing) rather than true erasure, which aligns with blockchain state patterns. The account remains frozen, preserving the historical linkage.

4. **Seal access integrity:**
   If an address could recreate its account, old data encrypted under the same Seal Key ID (`bcs(address)`) could become unpredictably accessible or orphaned depending on the new configuration. A permanent registry guarantees that the encryption identity mathematically maps to a single, stable onchain policy object forever.

## How account deactivation works

Deactivation does not freeze the `MemWalAccount` object at the Sui protocol level. The account is a shared object with an `active` boolean field, and `deactivate_account` sets that field to false. While the account is inactive, it denies Seal access and new delegate keys, but the owner can still remove delegate keys. Freezing the account also increments `access_counter_version`, so memories written later use a new Seal identity. The owner can call `reactivate_account` to unfreeze the account, unless an AdminCap holder has quarantined it with `admin_deactivate_account`. In every case, the registry entry for the address stays in place.
