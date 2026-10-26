---
title: "Walrus Sites v2.1.1"
description: "Walrus Sites 2.1.1 fixes the server portal so that only 5xx responses from an aggregator count as aggregator failures."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**December 4, 2025**

This bugfix release changes only the Portal component. The server portal now treats only 5xx
responses from an aggregator as aggregator failures. Responses outside the 5xx range do not count as
aggregator failures.

The release does not affect Site Builder. If you use Site Builder to publish or update sites, this
release contains no changes for you.
