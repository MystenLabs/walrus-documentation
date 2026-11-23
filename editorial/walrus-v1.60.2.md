---
title: "Walrus v1.60.2"
description: >-
  Storage nodes restart a stopped checkpoint tailing task after a backoff and no longer hang on
  shutdown or self-restart during the background consistency check.
keywords: ["walrus", "release notes", "changelog", "mainnet"]
---

**Mainnet** | November 11, 2026

This release contains 2 storage node fixes. If the checkpoint tailing task stops on its own, the
node now restarts it after a backoff. Previously, event processing stalled. One cause of a
stopped task is a full node that fails to serve a Move package.

The node also no longer hangs on shutdown or on self-restart while the background consistency check
is running. A self-restart can happen, for example, after a TLS certificate renewal. The same
changes ship in the Testnet release of this version.
