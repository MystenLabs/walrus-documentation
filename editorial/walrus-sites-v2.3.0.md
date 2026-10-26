---
title: "Walrus Sites v2.3.0"
description: >-
  Walrus Sites 2.3.0 refines `deploy --dry-run` output with Sui gas estimates and fixes site updates
  when a site has expired blobs.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**January 26, 2026**

The site-builder's `deploy --dry-run` output is clearer and now includes Sui gas estimates, so you
can preview a deployment's cost before you run it. The site-builder also groups files by size and
adds context to the error it reports when site fields are not found.

This release fixes updating a site that has expired blobs. On the server portal, it fixes a
serialization error that occurred when the portal caught an unexpected exception. It also includes a
fix to the portal's common code.
