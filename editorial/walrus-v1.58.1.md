---
title: "Walrus v1.58.1"
description: >-
  Storage nodes gain the `blob_info_snapshot.certify` config flag, a new RocksDB column family, and
  `blob_info_snapshot_*` metrics.
keywords: ["walrus", "release notes", "changelog", "mainnet"]
---

**Mainnet** | October 14, 2026

This release adds the `blob_info_snapshot.certify` config flag for storage nodes. The flag defaults
to `false`.

The storage node also uses a new RocksDB column family, `blob_info_snapshot_publication`, which it
creates automatically on the first start after you upgrade. New `blob_info_snapshot_*` metrics are
available for monitoring. No operator action is required.
