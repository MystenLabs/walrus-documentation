---
title: "Walrus Memory OpenClaw v0.0.6"
description: >-
  Fixes `openclaw plugins install`, adds relayer timeouts through `requestTimeoutMs`, and stops
  ordinary statements being flagged as prompt injection.
keywords: ["memwal-openclaw", "release notes", "changelog"]
---

**August 20, 2026**

`openclaw plugins install` now succeeds, and the plugin declares `contracts.tools`, so
`memory_search` and `memory_store` register. Config validation happens at register time with
per-field errors and leaves the gateway running. Every relayer call now has a deadline, set with
`requestTimeoutMs` (default 10000, range 1000 to 60000). A hung relayer no longer blocks the agent
turn.

The prompt-injection filter no longer silently drops ordinary statements such as "I run the deploy
command every Friday." The docs now cover `hooks.allowConversationAccess`, which auto-capture
requires. They also correct the config key: both `plugins.slots.memory` and the `plugins.entries`
key use `memory-memwal`.
