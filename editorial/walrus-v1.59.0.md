---
title: "Walrus v1.59.0"
description: >-
  Testnet storage nodes now attest their blob info snapshot on chain at each epoch boundary by
  default, and snapshot encoding uses less memory.
keywords: ["walrus", "release notes", "changelog", "testnet"]
---

**Testnet** | October 21, 2026

Storage nodes on the public testnet now attest their blob info snapshot on chain at each epoch
boundary, because `blob_info_snapshot.certify` defaults to `true` on testnet. To opt out, set
`blob_info_snapshot: {certify: false}` in the node config. The default on mainnet and other networks
is unchanged. Certification requires the version-4 system contract. On an older contract,
attestations fail and are counted, and nothing else changes. The node creates the
`blob_info_snapshot_publication` RocksDB column family automatically on first start. New
`blob_info_snapshot_*` metrics report durations, errors, and the latest certified epoch.

Peak memory for encoding the snapshot drops from about 5.5 to about 1.7 times the snapshot size.
Nodes and the CLI no longer read `WALRUS_GRPC_MIGRATION_LEVEL` and always use Sui gRPC, so you can
remove that variable from your environment.
