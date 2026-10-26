---
title: "Walrus Sites v2.9.1"
description: "Walrus Sites 2.9.1 fixes the portal request counter and lets the site-builder auto-resolve the Walrus package ID from the staking object."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**May 7, 2026**

This patch release fixes portal observability and site-builder configuration. It has no new
features, no breaking changes, and no Move contract changes. The site-builder no longer needs the
Walrus package ID in `sites-config.yaml` because it now resolves the ID from the Walrus staking
object. To pick this up, remove `walrus_package` from your `sites-config.yaml`. Alternatively,
update it to the latest package ID from the Walrus `staking_object` in
`~/.config/walrus/client_config.yaml`.

The portal now counts every request in `ws_num_requests_made_counter`. The site-builder also
includes updated Sui and Walrus dependencies.
