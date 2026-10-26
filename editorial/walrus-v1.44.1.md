---
title: "Walrus v1.44.1"
description: "Walrus 1.44.1 on Testnet fixes an issue where outdated epoch state could crash storage nodes."
keywords: ["walrus", "release notes", "changelog", "testnet"]
---

**Testnet** | March 11, 2026

This patch release for Testnet addresses a stability problem in the storage node. Previously,
storage nodes could crash when they encountered outdated epoch state. Version 1.44.1 fixes this
issue, so nodes no longer crash for this reason.

If you operate a storage node on Testnet, this release applies to you. The release notes describe no
other changes for developers or for client-side tooling.
