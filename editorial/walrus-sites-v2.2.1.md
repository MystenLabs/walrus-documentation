---
title: "Walrus Sites v2.2.1"
description: "The site-builder now uploads only new and modified files into new Quilts during site updates, so unchanged files are no longer re-uploaded."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**January 14, 2026**

When you update a site, the site-builder now creates new Quilts only for changed resources. Files
that stay the same are no longer re-uploaded. The site-builder also uses the correct Walrus package
ID from the Staking object when extending blobs, and its error output now includes the config path.

The server portal no longer includes the Amplitude integration.
