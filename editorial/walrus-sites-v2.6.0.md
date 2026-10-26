---
title: "Walrus Sites v2.6.0"
description: "The Walrus Sites portal now loads its configuration from a YAML file, and environment variables still work as overrides."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**February 26, 2026**

The portal now reads its configuration from a YAML file: `portal-config.yaml` by default, or the
path you set in `PORTAL_CONFIG`. All existing environment variables still work as overrides on top
of the YAML. See `portal-config.*.example.yaml` for the schema.

This release also includes the v2.5.0 priority-based executor. It tries RPC and Aggregator URLs in
priority order, with per-URL retries, using the format `URL|RETRIES|METRIC`. `AGGREGATOR_URL`
becomes `AGGREGATOR_URL_LIST`, and `RPC_URL_LIST` and `PREMIUM_RPC_URL_LIST` use the new format. The
portal still accepts the old format but prints a deprecation warning. The site builder now errors
gracefully on invalid glob patterns in `ws-resources.json` and fixes a lowercasing issue with header
mappings.
