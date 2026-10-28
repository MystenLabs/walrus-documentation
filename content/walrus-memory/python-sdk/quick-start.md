---
title: "Quick Start"
description: >-
  Install the Walrus Memory Python SDK and store your first memory in under a minute.
  Covers installation, configuration, environment presets, and a complete async example.
keywords:
  - Walrus Memory
  - Walrus Memory
  - Python SDK
  - quick start
  - installation
  - Ed25519
goal:
  description: Install the memwal Python package, create a Walrus Memory client with your account credentials, call remember() to store a memory, and confirm recall() returns it.
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
  - How do I install the Walrus Memory Python SDK?
  - How do I store and recall a memory with Walrus Memory in Python?
  - What are the Walrus Memory Python SDK entry points and when should I use each one?
answer: >-
  Install the Walrus Memory Python SDK with `pip install memwal`. Create a client
  with `MemWal.create()` using your Ed25519 delegate key and account ID, then call
  `remember_and_wait()` to store a memory and `recall()` to retrieve it. Use the
  `env` preset (`staging` or `prod`) to connect to the hosted relayer.
---

The Walrus Memory Python SDK (`memwal` on PyPI) gives your agents portable memory that works across apps, sessions, and workflows. Store, recall, and analyze context, fully under your control. It mirrors the TypeScript `MemWal` client: same relayer, same Ed25519 auth, same methods.

| Entry point | Import | When to use |
| --- | --- | --- |
| `MemWal` | `from memwal import MemWal` | **Recommended default**, async-native, relayer handles embeddings, Seal, and storage |
| `MemWalSync` | `from memwal import MemWalSync` | Scripts, notebooks, and non-async apps, same API, runs through `asyncio.run()` |
| `with_memwal_langchain` / `with_memwal_openai` | `from memwal import ...` | You already use LangChain or the OpenAI SDK and want memory as middleware |

## How do I install the Python SDK?

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/python-sdk/quick-start.md" target="_blank" className="code-source-link">Source: python-sdk/quick-start.md</a>

```bash
$ pip install memwal
```

## Try it in colab

Open the runnable [Walrus Memory Python SDK Colab](https://colab.research.google.com/drive/1SaKjkSp0DXnM_nktWSiEC-l9qGtVr6ph) for a notebook walkthrough covering installation, secure configuration, health checks, `remember`, `remember_async`, async job waiting, `recall`, bulk remember, `remember_bulk_async`, `remember_bulk_and_wait`, optional SDK utilities, OpenAI/LangChain middleware, OpenAI-compatible provider settings such as `OPENAI_BASE_URL`, and basic troubleshooting. It defaults to `staging` for test credentials and can switch to `prod` for production credentials.

Optional integrations:

<Tabs groupId="code">
<TabItem value="LangChain" label="LangChain">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/python-sdk/quick-start.md" target="_blank" className="code-source-link">Source: python-sdk/quick-start.md</a>

```bash
$ pip install memwal[langchain]
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/python-sdk/quick-start.md" target="_blank" className="code-source-link">Source: python-sdk/quick-start.md</a>

```bash
$ pip install memwal[openai]
```

</TabItem>
<TabItem value="Everything" label="Everything">

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/python-sdk/quick-start.md" target="_blank" className="code-source-link">Source: python-sdk/quick-start.md</a>

```bash
$ pip install memwal[all]
```

</TabItem>
</Tabs>

Requires a supported, patched Python 3.11+ runtime: 3.11.17, 3.12.15, 3.13.17, or 3.14.9 and newer patches in those series. Version 0.2.0 drops Python 3.9/3.10 support. The SDK requires patched `certifi` and `anyio` alongside `httpx` and `PyNaCl`. Update pip separately to 26.2.2+ in every venv; see Security updates.

## How do I configure the client?

Before wiring the SDK into your app:

- Generate a Walrus Memory account ID and delegate private key for your client using the hosted endpoint:
  - Production (Mainnet): `https://memory.walrus.xyz`
  - Staging (Testnet): `https://staging.memory.walrus.xyz`
- Choose a relayer:
  - Use the [managed relayer](/walrus-memory/relayer/public-relayer), selected with the `env` preset
  - Or pass an explicit `server_url` to your own relayer

`MemWal.create` takes the following arguments:

| Argument | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `key` | `str` | Yes | | Ed25519 delegate private key in hex |
| `account_id` | `str` | Yes | | Walrus Memory account object ID on Sui |
| `server_url` | `str` | No | `https://relayer.memory.walrus.xyz` | Explicit relayer URL, wins over `env` |
| `namespace` | `str` | No | `"default"` | Default namespace for memory isolation |
| `env` | `str` | No | | Hosted relayer preset: `staging` for testing or `prod` for production |

### Environment presets

Instead of hardcoding a URL, pass `env`. The public docs and Colab example use `staging` for testing and `prod` for production credentials.

| `env` | Relayer URL |
| --- | --- |
| `prod` | `https://relayer.memory.walrus.xyz` |
| `staging` | `https://relayer-staging.memory.walrus.xyz` |

Precedence: any explicit `server_url` wins, including the hosted default. `env` applies only when `server_url` is omitted (`None`). An unknown preset raises `ValueError`.

## How do I store and recall a memory?

`remember` returns as soon as the relayer accepts the job (~500ms); the upload + onchain commit run in the background. Use `remember_and_wait` to block until it is fully persisted. The following example calls `remember_and_wait` to block until the memory persists, then calls `recall`.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/python-sdk/quick-start.md" target="_blank" className="code-source-link">Source: python-sdk/quick-start.md</a>

```python
import asyncio
import os
from memwal import MemWal, RecallParams

async def main():
    memwal = MemWal.create(
        key=os.environ["MEMWAL_PRIVATE_KEY"],
        account_id=os.environ["MEMWAL_ACCOUNT_ID"],
        env="prod",
        namespace="demo",
    )

    await memwal.health()
    await memwal.remember_and_wait("I live in Hanoi and prefer dark mode.")

    result = await memwal.recall(RecallParams(query="What do we know about this user?"))
    for memory in result.results:
        print(memory.text, f"(distance: {memory.distance:.3f})")

    await memwal.close()

asyncio.run(main())
```

Prefer a synchronous style? Swap `MemWal` for `MemWalSync` and drop the `await`s, see [Usage](/walrus-memory/python-sdk/usage).

## Next steps

- [Usage](/walrus-memory/python-sdk/usage), async vs sync, namespace rules, manual methods, and middleware
- [API Reference](/walrus-memory/python-sdk/api-reference), full method signatures and result types
