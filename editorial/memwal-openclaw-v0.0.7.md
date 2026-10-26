---
title: "Walrus Memory OpenClaw v0.0.7"
description: >-
  Pins `memory_search` and `memory_store` to the calling agent's namespace and limits `${ENV_VAR}`
  interpolation to `privateKey`.
keywords: ["memwal-openclaw", "release notes", "changelog"]
---

**October 2, 2026**

`memory_search` and `memory_store` now operate only within the calling agent's namespace. If you
omit the namespace, the tools use that agent's namespace rather than the main namespace. A namespace
that the model supplies is rejected unless it matches the agent's namespace or its legacy namespace.

Configuration interpolation of `${ENV_VAR}` now applies only to `privateKey`. All other fields,
including `serverUrl`, are read literally, so a secret cannot end up in `serverUrl`.
