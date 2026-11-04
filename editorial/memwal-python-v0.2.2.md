---
title: "Walrus Memory Python SDK v0.2.2"
description: >-
  Adds namespace `forget`, clears key material on `destroy()`, and raises `MemWalError` for
  malformed responses.
keywords: ["memwal-python", "release notes", "changelog"]
---

**October 28, 2026**

`MemWal` and `MemWalSync` add `forget(namespace=None)`, with the alias `forget_namespace`. It wraps
`POST /api/forget`, deletes the owner's index rows for the namespace, leaves Walrus blobs in place,
and returns a `ForgetResult`. `destroy()` and `close(clear_keys=True)` zero the client's copy of the
seed, drop the signing key and cached Seal session credentials, and reject later calls with
`MemWalError`. `create()` accepts 32-byte `bytes` or `bytearray` keys and copies caller buffers, so
`destroy()` leaves yours intact.

An empty or non-JSON 2xx response now raises `MemWalJsonBodyError`, a `MemWalError` subclass,
instead of `json.JSONDecodeError`. A response missing a required field raises `MemWalError` instead
of `KeyError`. `ask()` and `recall()` reject a blank `question` or `query` and an invalid `limit` or
`max_distance` before signing. Cancelling one concurrent caller no longer aborts the others during
initialization.
