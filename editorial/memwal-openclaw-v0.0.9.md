---
title: "Walrus Memory OpenClaw v0.0.9"
description: >-
  Sub-agent memory now stays separate from the main agent's when a derived namespace or legacy alias
  collides with `defaultNamespace`.
keywords: ["memwal-openclaw", "release notes", "changelog"]
---

**November 4, 2026**

Sub-agent memory now stays separate from the main agent when the derived namespace or legacy alias
would collide with `defaultNamespace`. A colliding derived namespace is replaced with a
deterministic hashed namespace. In sub-agent sessions, `memory_search` and `memory_store` reject
explicit requests for the main namespace.

If a sub-agent's derived namespace previously equaled `defaultNamespace`, that sub-agent now uses
the hashed namespace. Memories already stored under `defaultNamespace` remain there, but that
sub-agent no longer recalls them automatically. This release also updates the MemWal SDK dependency
to `0.1.13`.
