---
title: "Walrus Memory MCP v0.0.15"
description: "A project-local `.memwal/credentials.json` now takes effect only after you approve it with `memwal-mcp approve-project`."
keywords: ["memwal-mcp", "release notes", "changelog"]
---

**October 21, 2026**

A project-local `.memwal/credentials.json` is ignored until you approve that exact project path,
account, delegate key, and relayer with `memwal-mcp approve-project`. Approvals are stored in
`~/.memwal/project-approvals.json`, and any change to the destination requires approving again.
Until then, the global credentials are used and a stderr line names the skipped file.
`memwal_health` now reports `account=` beside `relayer=`.

`MEMWAL_CREDS_DIR` must now be an absolute path outside the current project. Other values are
refused with an error, and an empty value means unset. The login write-ahead record moves out of the
repository to `~/.memwal/login-pending/`. `memwal_login` with `freshKey: true` now closes the
previous listener and names the abandoned public key and address so you can remove them from the
dashboard.
