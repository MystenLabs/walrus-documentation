---
title: "Walrus v1.51.2"
description: >-
  `walrus info committee` adds a `--commission-receivers` flag that prints commission receivers for
  the previous, current, and next committees as CSV.
keywords: ["walrus", "release notes", "changelog", "mainnet"]
---

**Mainnet** | July 9, 2026

This release adds a `--commission-receivers` flag to the `walrus info committee` command. When you
pass the flag, the CLI prints the commission receiver of every node in the previous, current, and
next committees in CSV format. For nodes whose commission receiver is an object, the output also
includes the address that owns that object.

The paired Testnet release of this version includes the same change.
