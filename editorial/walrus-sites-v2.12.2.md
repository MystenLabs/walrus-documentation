---
title: "Walrus Sites v2.12.2"
description: >-
  Portal Docker images move to the `oven/bun:1.4.3` (Debian 13) base image, so you can build the
  server-portal image again.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**October 21, 2026**

This release moves the portal Docker images to the `oven/bun:1.4.3` base image on Debian 13. The
previous base image reached end of life, which broke `apt` during the server-portal image build in
v2.12.1. If you build or run your own portal, the image now builds again. The site-builder is
unchanged from v2.12.1, and there are no Move contract changes.

`--dry-run` cost estimation still relies on the Sui JSON-RPC `dev_inspect` API, which public Sui
fullnodes no longer serve. Regular `deploy`, `publish`, and `update` commands work as before.
