---
title: "Walrus Sites v1.2.1"
description: "Walrus Sites 1.2.1 fixes site-builder transaction construction, dry runs for quilt publishing, and argument passing in portal logging."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**October 7, 2025**

This patch release contains bug fixes for the site-builder and the portal. The site-builder now
splits Move commands into programmable transaction blocks dynamically. Dry runs no longer throw an
error when you publish with quilts.

In the portal, a typo in the logger is fixed, and `getPropertiesWithContext` now passes its
arguments correctly.
