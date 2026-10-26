---
title: "Walrus Sites v2.4.0"
description: "The Walrus Sites portal now handles aggregator 403 and 404 errors with clearer messaging."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**February 9, 2026**

This release improves how the Walrus Sites portal reports errors. When an aggregator returns a 403
or 404 error, the portal now handles it and shows clearer messages.

If you run a portal, its logs also change. The logger now prints errors correctly, and error log
entries include the error's `.cause`.
