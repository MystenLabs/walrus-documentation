---
title: "Walrus Sites v2.11.0"
description: >-
  The Walrus Sites portal now reads from Sui over gRPC instead of JSON-RPC, ahead of the JSON-RPC
  deprecation.
keywords: ["walrus-sites", "release notes", "changelog"]
---

**July 6, 2026**

The portal now uses gRPC instead of JSON-RPC for its reads from Sui. This change prepares the portal
for the deprecation of the Sui JSON-RPC API. If you operate your own portal, it now communicates
with Sui over gRPC.

The site-builder updates its Sui and Walrus dependencies in this release.
