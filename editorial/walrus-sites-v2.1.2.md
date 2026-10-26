---
title: "Walrus Sites v2.1.2"
description: >-
  Walrus Sites 2.1.2 fixes the site-builder so you can destroy sites that contain more than 1000
  resources.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**December 16, 2025**

This release fixes a bug in the `site-builder` that affected destroying sites with more than 1000
resources. You can now destroy these large sites with the site-builder.

The release also updates the snake example. Its `examples/snake/ws-resources.json` file no longer
includes an `object_id` field. If you use the snake example as a starting point for your own site,
the updated file reflects this change.
