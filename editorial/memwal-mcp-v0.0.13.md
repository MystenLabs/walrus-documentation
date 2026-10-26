---
title: "Walrus Memory MCP v0.0.13"
description: "Walrus Memory MCP 0.0.13 fixes misleading retry advice, reports relayer auth and rate-limit errors clearly, and repairs in-session `memwal_login`."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**September 15, 2026**

Timed-out writes from `memwal_remember`, `memwal_remember_bulk`, and `memwal_analyze` now warn that
the write might have completed and tell you to check with `memwal_recall` before re-saving, which
avoids duplicate paid copies. The bridge reports a rejected delegate key immediately and points to
`memwal_login`. It backs off on HTTP 429 using `Retry-After`. It fails requests stuck behind a
failing handshake after 90s, which you can override with `MEMWAL_MCP_STALLED_HANDSHAKE_MS`.

After an in-session `memwal_login`, the bridge keeps reading stdin and confirms the sign-in. The CLI
writes credentials as a new `0600` file, warns about unrecognized options, and lists network presets
in `--help`. `memwal_health` now reports the relayer URL, and `memwal_restore` retries a page after
a transient failure.
