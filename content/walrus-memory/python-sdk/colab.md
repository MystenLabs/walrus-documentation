---
title: "Colab Notebook"
description: >-
  Run the Walrus Memory Python SDK from Google Colab. A notebook-first walkthrough
  covering installation, credential configuration, all SDK methods, and middleware integrations.
keywords:
  - Walrus Memory
  - Walrus Memory
  - Python SDK
  - Google Colab
  - notebook
  - tutorial
goal:
  description: Open the Walrus Memory Python SDK Colab notebook, run each cell to store and recall memories, and use it as an interactive reference before integrating the SDK into your own project.
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
  - Is there a Colab notebook for the Walrus Memory Python SDK?
  - How do I try the Walrus Memory Python SDK without local setup?
  - What does the Walrus Memory Python SDK Colab notebook cover?
answer: >-
  The Walrus Memory Python SDK Colab notebook provides a runnable walkthrough covering
  installation, secure credential loading, health checks, remember/recall, bulk operations,
  analyze, ask, embed, manual methods, restore, OpenAI/LangChain middleware, and
  troubleshooting. It defaults to staging for test credentials.
---

The [Walrus Memory Python SDK Colab](https://colab.research.google.com/drive/1SaKjkSp0DXnM_nktWSiEC-l9qGtVr6ph) is a runnable notebook that walks you through installing, configuring, and calling the Walrus Memory Python SDK from Google Colab. It defaults to `staging` for test credentials. Use it when you want a notebook-first walkthrough, or as an interactive reference before you integrate the SDK into your own project.

## How to run the notebook

To run the notebook:

1. Open the [Walrus Memory Python SDK Colab](https://colab.research.google.com/drive/1SaKjkSp0DXnM_nktWSiEC-l9qGtVr6ph).
2. Load your credentials through Colab Secrets or hidden prompts.
3. Run each cell to store and recall memories.

## What does the notebook cover?

The notebook covers:

- installing `memwal`
- loading credentials through Colab Secrets or hidden prompts
- configuring the SDK without exposing private keys, defaulting to `staging`
- switching to `prod` when you have production credentials
- creating `MemWalSync` for notebook-friendly calls
- checking relayer `health`, compatibility, and delegate public key derivation
- storing memory with `remember`
- waiting for async remember jobs to persist on Walrus
- retrieving memory with `recall`
- using `remember_async`, `remember_and_wait`, bulk remember, `remember_bulk_async`, `remember_bulk_and_wait`, `ask`, `analyze`, `analyze_and_wait`, `embed`, manual search/register with scoring weights, and `restore`
- optionally wrapping OpenAI and LangChain clients with Walrus Memory middleware
- using `OPENAI_BASE_URL` for OpenAI-compatible providers such as OpenRouter
- basic troubleshooting for auth, namespaces, and async remember jobs

The repo copy lives in [`packages/python-sdk-memwal/notebooks/walrus_memory_python_sdk.ipynb`](https://github.com/MystenLabs/MemWal/blob/main/packages/python-sdk-memwal/notebooks/walrus_memory_python_sdk.ipynb).
