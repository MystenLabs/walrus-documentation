---
title: "Walrus Memory TypeScript SDK v0.1.4"
description: "Empty-body 401 errors now tell first-time MCP callers to run `memwal_login` instead of showing `<no message>`."
keywords: ["memwal-sdk", "release notes", "changelog"]
---

**August 24, 2026**

This release improves the error message for empty-body 401 responses. If you are calling through MCP
for the first time and receive an empty-body 401, the SDK now tells you to run `memwal_login`.
Previously it showed `<no message>`, which gave no indication of what to do next.

Credential 401s keep their existing behavior and still point you to the AUTH_REJECTED
troubleshooting guide.
