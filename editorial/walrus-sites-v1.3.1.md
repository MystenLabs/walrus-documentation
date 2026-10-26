---
title: "Walrus Sites v1.3.1"
description: >-
  Adds a `DeployQuilts` command to site-builder behind the `quilts-experimental` feature flag and
  fixes several Quilts-related bugs.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**November 3, 2025**

This release continues work on the `quilts-experimental` feature flag in site-builder. It adds a
`DeployQuilts` command that is available only when the `quilts-experimental` flag is enabled. The
`update-quilts` command is also now gated under the same flag.

Bug fixes in site-builder include respecting the large files limit when using Quilts and inserting
routes only after all resources are created. The progress message shown when storing Quilts now
reads "and storing Quilts" for clarity. This release also adds tests for the Quilts lifecycle during
site updates and for deploying with `--list-directory`.
