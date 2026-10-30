---
title: "SEAL Cross-Account Synthetic"
description: >-
  How operators schedule the production-safe negative synthetic that pages if
  an identity from Walrus Memory account A can authorize account B's SEAL key.
keywords:
  - Walrus Memory
  - Walrus Memory
  - SEAL
  - synthetic
  - cross-account
  - CI
goal:
  description: Configure two isolated test accounts and run the read-only SEAL cross-account synthetic on a schedule.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 150
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - "How do I run the SEAL cross-account synthetic?"
  - "What secrets does the SEAL cross-account synthetic need?"
  - "How do I schedule the SEAL cross-account check in production?"
answer: >-
  Run `scripts/synthetic-seal-cross-account.mjs` or dispatch
  `.github/workflows/synthetic-seal-cross-account.yml`. The check is read-only:
  it dry-runs `seal_approve` and never writes memories or mutates chain. Unset
  secrets skip the job (exit 0). If identity A can authorize account B, the job
  exits 1 with `SYNTHETIC_SEAL_CROSS_ACCOUNT_FAIL` and should page on-call.
  Schedule it with `gh workflow run` or an ops cron that dispatches that workflow.
---

## What is the Seal cross-account synthetic?

The Seal cross-account synthetic alerts if a live identity from account A can
authorize account B's Seal key. It is a production-safe **negative** check on
top of the Move unit test `test_seal_approve_delegate_requires_matching_owner`.
The unit test covers the contract in isolation.

The script is **read-only**. It never calls remember, never fetches Seal
decryption keys, and never executes a transaction. It `devInspect`s
`account::seal_approve` only. `devInspect` dry-runs the call without executing
a transaction.

## When it runs

`.github/workflows/synthetic-seal-cross-account.yml` is `workflow_dispatch`
only. It does **not** run on pull requests, so a PR without production secrets
cannot page and cannot touch chain.

If the two account ids and two delegate keys are unset, the script prints
`skip` and exits 0. A skipped run is green but checked nothing, so confirm the log does not say `skip` before counting a passing job as coverage.

## Secrets and variables

Use two **isolated** Walrus Memory accounts (different owners). Each key must be a
delegate or owner of its own account and must **not** be registered on the other.

| Name | Where | Purpose |
| --- | --- | --- |
| `SEAL_CROSS_ACCOUNT_A_ID` / `SEAL_CROSS_ACCOUNT_B_ID` | GitHub secret | Account object ids |
| `SEAL_CROSS_ACCOUNT_A_KEY` / `SEAL_CROSS_ACCOUNT_B_KEY` | GitHub secret | Delegate private keys (hex or `suiprivkey1…`) |
| `SUI_RPC_URL` | GitHub variable | JSON-RPC fullnode |
| `MEMWAL_PACKAGE_ID` | GitHub variable | Policy package id |
| `MEMWAL_REGISTRY_ID` | GitHub variable | `AccountRegistry` object id |
| `MEMWAL_SERVER_URL` | GitHub variable or workflow input | Optional; `GET /config` fills package id and RPC URL |
| `SUI_NETWORK` | GitHub variable | `mainnet` or `testnet` when the RPC URL does not say |

Do not commit private keys. Do not reuse the shared benchmark account as both A and B.

## Schedule (ops)

Dispatch from a protected ref after the secrets exist:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/relayer/synthetic-seal-cross-account.md" target="_blank" className="code-source-link">Source: relayer/synthetic-seal-cross-account.md</a>

```bash
$ gh workflow run synthetic-seal-cross-account.yml --ref main
```

Or Actions → **Synthetic Seal cross-account** → **Run workflow**.

To cron it, add `on.schedule` to `.github/workflows/synthetic-seal-cross-account.yml`
once the two-account secrets are in place (left off by default so an empty repo
cannot false-green or page):

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/relayer/synthetic-seal-cross-account.md" target="_blank" className="code-source-link">Source: relayer/synthetic-seal-cross-account.md</a>

```yaml
on:
  schedule:
    - cron: "17 6 * * *"   # daily 06:17 UTC
  workflow_dispatch:
```

Point the workflow failure at on-call. A red job whose log contains
`SYNTHETIC_SEAL_CROSS_ACCOUNT_FAIL` means live `seal_approve` allowed a
cross-account identity. That is a Seal policy regression, not a flake. Conversely, a green run whose log contains neither `skip` nor `SYNTHETIC_SEAL_CROSS_ACCOUNT_FAIL` is the real passing result: the secrets exist and live `seal_approve` rejected the cross-account identity.

## Create the 2 isolated accounts

Generate each account ID and delegate private key from the hosted Walrus Memory dashboard on the network the synthetic targets:

- Production (Mainnet): `https://memory.walrus.xyz`
- Staging (Testnet): `https://dev.memwal.ai`

Connect a different wallet for each account so the 2 accounts have different owners. To add a delegate key to an account you already own, create a new delegate key from the dashboard. The dashboard generates a fresh key pair and registers it to that account onchain. Save the private key securely, because the dashboard shows it only once.
