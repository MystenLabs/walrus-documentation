---
title: "Walrus Sites v1.1.0"
description: >-
  Walrus Sites adds experimental quilt-based publishing through `site-builder publish-quilts`, which
  reduces site publishing costs.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**September 8, 2025**

This release adds an experimental way to publish sites as quilts instead of blobs. `site-builder
publish-quilts --epochs=<EPOCHS> <YOUR-BUILD-DIR>` bundles multiple resources as quilt patches on
Walrus, which significantly reduces publishing cost. The command is available only when you build
`site-builder` from source with `cargo build --features quilts-experimental`. The portal now derives
`quiltpatchid` and retrieves quilt-based resources.

`site-builder` now updates the site name when it changes in `ws-resources.json`. An explicit
`walrus_package` argument now overrides the config value, and `site-builder` catches transaction
failures earlier. The portal and server portal no longer include Sentry or Vercel web analytics.
