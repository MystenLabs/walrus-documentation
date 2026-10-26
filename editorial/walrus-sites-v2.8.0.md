---
title: "Walrus Sites v2.8.0"
description: "Walrus Sites 2.8.0 adds server-side redirects, configured in `ws-resources.json` and stored on-chain through a `walrus_site` Move package upgrade."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**April 2, 2026**

This release adds server-side redirects. You define redirect rules with glob pattern matching in
`ws-resources.json`. The rules are stored as dynamic fields on the on-chain `Site` object. The
portal evaluates redirects before fetching resources and serves a 3xx response. To use redirects,
update `package_id` in `sites-config.yaml` to the latest upgraded `walrus_site` package ID. You can
also remove the field so MVR resolves it automatically.

The portal config field `site_package` is renamed to `original_package_id`. The portal now uses
Mysten SDK v2. The server portal's aggregator histogram no longer includes the `blobOrPatchId` and
`path` labels.
