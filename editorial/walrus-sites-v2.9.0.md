---
title: "Walrus Sites v2.9.0"
description: >-
  The site builder fetches resource dynamic fields in one batched `multi_get` call, and `sitemap`
  now uses the active wallet environment.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**April 23, 2026**

The site builder now fetches resource dynamic fields with a single batched `multi_get` call.
Previously, it used chunked per-resource queries with delays between batches. This change improves
performance and reliability when the site builder reads site resources.

The `sitemap` subcommand now uses the active wallet environment for its RPC calls. Previously, it
used whichever environment appeared first in the config. This release also fixes the script for
running the portal locally in Docker and suppresses noisy output from the meta logger.
