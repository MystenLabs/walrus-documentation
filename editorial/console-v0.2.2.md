---
title: "Walrus Console v0.2.2"
description: >-
  Walrus Console 0.2.2 shows upload progress by stage, reports renamed uploads, and gives
  programmatic clients a policy preflight and typed upload refusals.
keywords: ["console", "release notes", "changelog"]
---

**November 3, 2026**

Programmatic clients can now check upload policy before sending a file, receive a typed reason
when an upload is refused, and read the deletion status of an account. When an upload takes a name
that is already in use, the reply says that a suffix was added.

In the web app, upload progress shows the current stage while the file is stored on Walrus, and the
upload dock confirms when all uploads complete. The sign-in page has an updated design, an expired
Enoki login no longer breaks Google sign-in, and deleting your account revokes its Walrus Memory
link. The release also includes security strengthening.
