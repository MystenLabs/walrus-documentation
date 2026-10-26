---
title: "Walrus Sites v2.10.0"
description: >-
  The portal bounds each aggregator attempt with a timeout and sizes Bun's `idleTimeout` from the
  retry budget so it can return its own error page.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**June 4, 2026**

The portal now bounds each aggregator fetch attempt at 10 seconds and fails over to the next
aggregator URL. It sizes Bun's `idleTimeout` from the full retry chain. A slow aggregator no longer
drops the inbound connection mid-request and causes a generic upstream proxy error. Instead, the
portal returns its own `aggregatorFail()` page.

Portal operators can tune this behavior with `AGGREGATOR_REQUEST_TIMEOUT_MS` (default `10000`) and
`PORTAL_IDLE_TIMEOUT_MAX_S` (default `100`). The portal sanitizes and logs the resolved values at
startup. The site-builder updates Sui to `testnet-v1.73.0` and Walrus to `testnet-v1.50.0`. This
release has no Move contract changes.
