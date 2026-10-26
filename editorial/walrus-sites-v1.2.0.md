---
title: "Walrus Sites v1.2.0"
description: >-
  Walrus Sites 1.2.0 switches `ws-resources.json` header and ignore matching to glob patterns and
  extends experimental quilt support.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**September 22, 2025**

Header and ignore-file matching in `ws-resources.json` now uses glob patterns, such as `*.md` and
`docs/**`, instead of regular expressions. Regex support was never intentional, so if your
configuration relies on advanced regex, update it to glob style. This release also fixes how
`--list-directory` handles ignore files.

Quilt support under the `quilts-experimental` feature expands. The site-builder adds an
`UpdateQuilts` command that deletes and re-creates all resources, and it shows quilt patch IDs in
publish, update, and sitemap output. The deploy action now supports wallet exported keys and fixes
how it uses inputs. Range header building in common-lib is also fixed.
