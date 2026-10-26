---
title: "Walrus Sites v2.12.1"
description: "Walrus Sites 2.12.1 updates the site-builder to build against Walrus `testnet-v1.58.1` and Sui `testnet-v1.81.0`."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**October 21, 2026**

This release updates the site-builder dependencies. It now builds against Walrus `testnet-v1.58.1`
and Sui `testnet-v1.81.0`, up from `testnet-v1.51.2` and `testnet-v1.74.0`, and uses the Rust 1.96
toolchain. The portal and the Move contracts are unchanged.

One known limitation remains. `--dry-run` cost estimation still relies on the Sui JSON-RPC
`dev_inspect` API, which public Sui fullnodes no longer serve, so cost estimates might not work
against those nodes. Regular `deploy`, `publish`, and `update` commands are unaffected. A gRPC-based
estimate is planned for a follow-up release.
