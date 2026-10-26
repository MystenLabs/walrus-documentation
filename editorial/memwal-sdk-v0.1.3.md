---
title: "Walrus Memory TypeScript SDK v0.1.3"
description: "Adds client-side token estimation and recall token budgets, and changes the default relayer URL to `https://relayer.memory.walrus.xyz`."
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**August 20, 2026**

The SDK now estimates tokens on the client side and supports token budgets for recall. When recalled
content exceeds a budget, you can choose how the SDK truncates it by setting one of the configurable
truncation strategies.

This release also changes the default SDK relayer URL to `https://relayer.memory.walrus.xyz`. If
your application relies on the default relayer rather than setting one explicitly, it uses the new
URL after you upgrade.
