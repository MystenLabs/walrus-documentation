---
title: "Walrus v1.51.1"
description: >-
  `walrus info committee` adds a `--commission-receivers` flag that prints the commission receiver
  of each committee node as CSV.
keywords: ["walrus", "release notes", "changelog", "mainnet"]
---

**Mainnet** | July 9, 2026

The `walrus info committee` command now accepts a `--commission-receivers` flag. When you set it,
the CLI prints the commission receiver of every node in the previous, current, and next committees
in CSV format. For nodes whose commission receiver is an object, the output also includes the
address that owns that object. This release includes the same change on Mainnet and Testnet.
