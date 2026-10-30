---
title: Reference
description: >-
  Complete reference for Walrus Memory MCP tools, CLI flags, environment presets, transport routes, and self-hosting.
  Covers all eight tools, credential management, stdio and HTTP transports, and runtime safety details.
keywords:
  - MCP
  - Walrus Memory
  - Walrus Memory
  - reference
  - CLI
  - transports
  - self-hosting
goal:
  description: Look up the exact CLI flags, transport options, tool parameters, and configuration schema for the @mysten-incubation/memwal-mcp package.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 300
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - What are the parameters for the Walrus Memory MCP tools?
  - How do I configure the Walrus Memory MCP CLI flags and environment variables?
  - How do I set up Streamable HTTP transport for Walrus Memory MCP?
answer: >-
  The Walrus Memory MCP reference documents eight tools (memwal_remember, memwal_remember_bulk, memwal_recall, memwal_analyze, memwal_restore, memwal_health, memwal_login, memwal_logout) with full parameter details. It covers CLI flags such as --relayer, --namespace, and --label, environment presets (prod, staging, local), two transport modes (stdio and Streamable HTTP), credential file format, default namespace precedence, self-hosting configuration, and runtime safety notes for 401 handling and relayer overrides.
---

The Walrus Memory MCP package exposes MCP tools, CLI flags, environment variables, and transport routes. For per-client setup, start with the [MCP overview](/walrus-memory/mcp/overview).

## Tools

The MCP server exposes **eight tools**: six **relayer tools** (memory operations plus a health check) and two **session tools** served locally by the stdio package. For the lifecycle hooks that drive these tools automatically, see [Claude Code](/walrus-memory/mcp/claude-code) or [Codex](/walrus-memory/mcp/codex).

## First-run behavior

When the stdio package finds no credentials file (see [Credential locations](#credential-locations)), it does **not** exit immediately if an MCP host launched it.

Instead it starts in an auth-required mode that:

- responds to MCP `initialize`
- exposes the memory tools plus `memwal_login`
- returns an actionable error for memory tool calls until sign-in completes

This is why many first-run sessions show `memwal_login` before the other tools are actually usable.

### `memwal_remember`

Save a durable fact to the user's Walrus Memory. The agent calls this **proactively** when the user states a preference, decision, constraint, correction, identity detail, or recurring workflow, not only when they explicitly ask, provided automatic memory is on. That is the user's standing answer to a question `memwal-mcp login` asks once in a terminal; the user can change it with `memwal-mcp auto-save on|off`. Skip one-off tasks, the current file or bug, and small talk. Pass the full statement; do not summarize.

This tool, `memwal_remember_bulk`, and `memwal_analyze` never store credentials. Before the write, they strip passwords, API keys, access and refresh tokens, private keys, seed phrases, authorization headers, session cookies, and URLs with an embedded `user:password` from the text. A message that mixes a preference with a credential keeps the preference and loses only the credential; the reply names which kinds the tool removed.

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| `text` | string | yes | The complete fact to save. |
| `namespace` | string | no | Namespace bucket. Defaults to the session namespace. |

### `memwal_remember_bulk`

Save several durable facts in one batched call. Prefer this over repeated `memwal_remember` calls when the agent learns multiple distinct facts at once.

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| `facts` | string[] (1–20) | yes | Array of complete fact statements, one full fact per entry, no summarizing. |
| `namespace` | string | no | Namespace bucket applied to every fact. Defaults to the session namespace. |

### `memwal_recall`

Search the user's Walrus Memory for facts relevant to a query. The agent calls this **proactively** at the start of a task or when the user references past work, decisions, or preferences. Returns matches ranked by relevance.

Each result line includes `score` and `distance`. `distance` is cosine distance (low = similar). Displayed `score` is `1 − cosine distance` (high = similar). Optional `maxDistance` is a cosine-distance cutoff: the tool drops hits with `distance >= maxDistance`. Omit `maxDistance` to apply no cutoff.

The tool applies the cutoff to the `limit` nearest matches, not before them, so a tight `maxDistance` returns fewer than `limit` results. That is the cutoff biting, not an empty namespace. Raise `limit` to widen the candidate pool the cutoff sees.

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| `query` | string | yes | Natural-language query to match against stored memories. |
| `limit` | integer (1–100) | no | Max memories to return. Default `10`. |
| `namespace` | string | no | Namespace bucket to search. |
| `maxDistance` | number (>= 0) | no | Cosine-distance cutoff (low = similar). The tool drops hits with `distance >= maxDistance`. Omit for no cutoff. |

### `memwal_analyze`

Extract memorable facts from a longer passage of text (preferences, habits, biographical information, constraints) and save each as a separate memory.

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| `text` | string | yes | Conversation transcript, note, or arbitrary text to extract from. |
| `namespace` | string | no | Namespace for the extracted facts. |

### `memwal_restore`

Re-index a namespace from Walrus blobs back into the relayer's search index. Returns counts (`restored` / `skipped` / `total`) plus `truncated`, and does **not** return memory texts. Call `memwal_recall` afterwards to query the rebuilt index.

`truncated=true` means this restore is **known-retryable-incomplete**: more missing blobs than `limit` allowed this call to restore, **or** the sidecar's owner-wide candidate fetch hit its cap **and** raising `limit` can still expand that fetch (`limit < 20`). Once the sidecar cap is saturated (`limit >= 20`, cap pinned at 100), truncation follows this call's missing-blob page length, not onchain `total`. A fully restored namespace does not loop. `truncated=false` is **not** proof the sidecar saw every onchain blob; blobs beyond the owner-wide sidecar candidate cap can still be missing. WALM-451 tracks a `sourceCapped` field for that case ([WALM-451](https://linear.app/mysten-labs/issue/WALM-451)). Relayers older than WALM-319 omit `truncated`; SDKs default it to `false`.

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| `namespace` | string | yes | Namespace bucket to restore. |
| `limit` | integer (1–100) | no | Max memories to re-index. Default `10`. The relayer clamps values outside that range. |

### `memwal_health`

Lightweight connectivity check. Calls the relayer's public `/health` endpoint (no request signing, no search or decryption) and returns its `status` and `version`. Use this to confirm the server is reachable instead of `memwal_recall`, which is a full retrieval round-trip. Takes no parameters.

### `memwal_login`

Open a browser to sign in (or re-sign in) with your Sui wallet. Use to switch wallets, refresh credentials, or sign in for the first time inline. Takes no parameters.

Returns a one-time URL valid for **5 minutes**. If it expires, call the tool again to mint a fresh URL.

### `memwal_logout`

Remove the saved credentials from this machine, from whichever file is currently in use (see [Credential locations](#credential-locations)). Takes no parameters.

:::warning
`memwal_logout` does **not** revoke the onchain delegate key registration, it only wipes the local file. Visit the [Walrus Memory dashboard](https://memory.walrus.xyz) to remove the delegate key from your account.
:::

:::note
The stdio package intercepts both session tools (`memwal_login`, `memwal_logout`) locally, so they never reach the relayer. They read and write files on the client machine only.
:::

## Credential locations

Credentials resolve from two places, in order:

1. `.memwal/credentials.json` in the **working directory or a parent of it**, used only once you have [approved it](#approving-a-project-file)
2. `~/.memwal/credentials.json` (global, per machine)

The search starts in the working directory and walks up, the way `.npmrc` and `.git/config` resolve, so a command run from a subfolder still picks up that project's credentials. The first `.memwal/credentials.json` it finds wins, provided you approved it.

The walk stops at your project root (the directory holding `.git`), at your home directory, or at the filesystem root, whichever comes first. That bound keeps one project from picking up a credentials file belonging to a parent folder that holds unrelated checkouts. If the search finds nothing inside it, the package uses the global file. The package reads, writes, and deletes whichever file it chooses for that run.

### Approving a project file

A project's `.memwal/credentials.json` lives inside the repository, so anyone who can commit to it, or who can get you to open a clone, could otherwise pick the account and relayer every memory written from that directory goes to. The package therefore **ignores the file until you approve it**, once per machine:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```bash
$ cd ~/code/my-project
$ memwal-mcp approve-project
```

Until then the package uses the global credentials, and one stderr line names the file it skipped, the account and relayer that file wanted, and this command. An approval covers one exact project path, account, delegate key, and relayer: change any of them and you have to approve it again. The package keeps the record in `~/.memwal/project-approvals.json`, outside the repository, so a repository cannot carry its own approval. `memwal-mcp revoke-project` withdraws it.

Approving decides which file the package writes as well as which it reads. From then on a sign-in from that project stores a delegate private key, in plain text, in `.memwal/credentials.json` inside the repository. `approve-project` and the pre-sign-in warning both say so. Add `.memwal/` to `.gitignore`. The package keeps the login write-ahead record in `~/.memwal/login-pending/`, and that record never enters the repository.

`MEMWAL_CREDS_DIR` overrides project resolution entirely and needs no approval. Because it skips the gate it must be an **absolute path outside the current project**, and the package refuses anything else with an error rather than ignoring it: a relative value resolves against the working directory, which would put the credentials and the approval record inside the repository, and an MCP client hands this process the `env` block it reads from `.cursor/mcp.json`, `.vscode/mcp.json`, or `.claude/settings.json` in the checkout, where editors expand `${workspaceFolder}`, so an in-project absolute path is not evidence you set it. An empty value means unset.

### Working on several accounts

Without a project-local file, every project on the machine shares one credential. Signing in from one project silently repoints the others at a different account and delegate key, and memories written in that state land on the wrong account, on immutable storage, with no delete path.

To scope a project to its own account, create the file inside it:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```bash
$ cd ~/code/my-project
$ mkdir -p .memwal
$ memwal-mcp login          # writes to the global file the first time
$ cp ~/.memwal/credentials.json .memwal/credentials.json
$ memwal-mcp approve-project
```

From then on, runs started from that directory or anywhere beneath it use the project's credentials, and runs started outside it keep using the global one.

:::warning
`.memwal/credentials.json` holds a delegate private key. Add `.memwal/` to your `.gitignore`.
:::

### Migration

Nothing to do for a machine without a project-local file: it behaves exactly as it did before, and the global file remains the fallback indefinitely.

If you already have a project-local file, run `memwal-mcp approve-project` in that project once. Until you do, runs from it fall back to the global credentials and say so on stderr, they do not fail.

### Replacing an account

Signing in as a **different** account than the one already saved:

- warns before the browser opens, naming the account currently saved and the file at risk
- copies the outgoing file to `credentials.backup-<timestamp>.json` beside it
- prints both account ids afterwards, and where the backup went

Re-signing in as the **same** account (a label change, a rotated delegate key) overwrites in place without a backup.

### Recovery

To restore a replaced credential, copy the backup back over the live file:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```bash
$ cd ~/.memwal            # or the project's .memwal directory
$ ls credentials.backup-*
$ cp credentials.backup-<timestamp>.json credentials.json
$ chmod 600 credentials.json
```

Backups accumulate; the package never prunes them automatically. Each holds a delegate private key, so delete the ones you no longer need.

## CLI

The stdio package accepts CLI flags and environment variables. **CLI takes precedence** when both are set.

| **CLI flag** | **Environment variable** | **Description** |
| --- | --- | --- |
| `--relayer <url>` | `MEMWAL_SERVER_URL` | Override the relayer base URL. |
| `--web-url <url>` | `MEMWAL_WEB_URL` | Override the dashboard URL used during login. |
| `--label <text>` | `MEMWAL_CLIENT_LABEL` | Friendly delegate-key label shown in the Walrus Memory dashboard. |
| `--namespace <name>` (alias `--ns`) | `MEMWAL_NAMESPACE` | Default memory namespace injected into memory tool calls that omit one. See [Default namespace](#default-namespace). |
| `--login` (or `login` subcommand) | Not applicable | Force a re-login even when credentials exist. The package keeps the existing file until the new sign-in succeeds. |
| `--logout` | Not applicable | Delete the credentials file currently in use and exit. |
| `approve-project` | Not applicable | Approve the project-local `.memwal/credentials.json` found from the current directory, so the package uses that file here. Requires an interactive terminal. See [Approving a project file](#approving-a-project-file). |
| `revoke-project` | Not applicable | Withdraw that approval. Requires an interactive terminal. |
| `--help`, `-h` | Not applicable | Print usage and exit. |

Set `MEMWAL_MCP_DEBUG=1` to enable verbose stderr logging.

## Default namespace

Set a default memory namespace once in your client config instead of having the agent pass `namespace` on every call. The package injects it into `memwal_remember`, `memwal_remember_bulk`, `memwal_recall`, `memwal_analyze`, and `memwal_restore` calls that don't already carry one.

Precedence, highest first:

1. **Explicit per-call `namespace`**. The package forwards a non-empty `namespace` in the tool call unchanged, and the configured default never overrides it.
2. **`--namespace` CLI flag** (alias `--ns`).
3. **`MEMWAL_NAMESPACE` environment variable**.
4. **Unset**. The package forwards the call without a `namespace`, and the relayer applies its own `"default"` namespace.

CLI wins over the environment variable when you set both, which matches every other flag in the [CLI](#cli) table.

:::note
`memwal_restore` still lists `namespace` as **required** in its tool schema, so agents normally pass one explicitly. The configured default only acts as a fallback when the agent calls `memwal_restore` without a namespace.
:::

Example, pin every memory call to a `work` namespace:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```json
{
  "mcpServers": {
    "memwal": {
      "command": "npx",
      "args": ["-y", "@mysten-incubation/memwal-mcp", "--namespace", "work"]
    }
  }
}
```

## Credential file

The stdio package stores credentials in whichever file [Credential locations](#credential-locations) resolves to: a project-local `.memwal/credentials.json`, or the global `~/.memwal/credentials.json`.

The file includes:

- delegate private key
- delegate public key
- delegate address
- wallet address
- account ID
- package ID
- relayer URL
- label
- creation timestamp

The package writes the file with restrictive permissions (`0600`) on supported systems.

:::warning
Treat the delegate private key in this file like an API key. Anyone who gets it can act as this MCP client until you revoke the delegate.
:::

## Client config paths

Common local config locations:

- **Cursor:** `~/.cursor/mcp.json`
- **Claude Desktop (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Codex:** `~/.codex/config.toml`
- **Claude Code:** stored through the `claude mcp add` registry

### Environment presets

Shortcut flags that set both the relayer and the dashboard URL in one switch:

| **Flag** | **Relayer** | **Dashboard** |
| --- | --- | --- |
| `--prod` | `https://relayer.memory.walrus.xyz` | `https://memory.walrus.xyz` |
| `--staging` | `https://relayer-staging.memory.walrus.xyz` | `https://staging.memory.walrus.xyz` |
| `--local` | `http://127.0.0.1:8000` | `http://localhost:5173` |

Explicit `--relayer` and `--web-url` override the preset. You can also pass either flag without a preset to point at a custom URL.

## Transports

Walrus Memory supports two MCP connection modes.

| **Mode** | **Best for** | **How you configure it** |
| --- | --- | --- |
| **stdio package** | Clients that run local MCP commands (most clients today) | `npx -y @mysten-incubation/memwal-mcp` in the client config |
| **Streamable HTTP** | Clients that support remote HTTP MCP servers | `url: "https://relayer.memory.walrus.xyz/api/mcp"` + auth headers |

### Streamable HTTP

Use HTTP transport when your client supports remote MCP servers natively. Authentication is bearer-token + account ID per request:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```json
{
  "mcpServers": {
    "memwal": {
      "url": "https://relayer.memory.walrus.xyz/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_DELEGATE_PRIVATE_KEY>",
        "x-memwal-account-id": "<YOUR_ACCOUNT_ID>"
      }
    }
  }
}
```

The bearer token is the `delegatePrivateKey` from `~/.memwal/credentials.json`. The account ID is the `accountId` field in that same file. Run `npx -y @mysten-incubation/memwal-mcp login --prod` once to populate it.

:::warning
The bearer token is a long-lived credential equivalent to an API key. **Never commit MCP configs with a real `Authorization` header to source control.** Treat it like any other secret.
:::

For Claude Code, the equivalent registration command is:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```bash
$ claude mcp add --transport http memwal https://relayer.memory.walrus.xyz/api/mcp
```

If your client cannot attach headers from the CLI, edit the generated MCP config file to add them manually.

### OAuth (Claude custom connectors)

Claude's native **Add custom connector** flow speaks OAuth 2.1 rather than the explicit-header model in [Streamable HTTP](#streamable-http). Claude discovers an authorization server, registers itself as a client, and sends the user through a hosted consent screen instead of expecting a pasted bearer token. For the end-user steps, see [Claude custom connector](/walrus-memory/mcp/claude-connector).

When an operator configures OAuth, the hosted relayer additionally exposes:

- `GET /.well-known/oauth-protected-resource` (+ the `/api/mcp`-suffixed variant Claude probes first), RFC 9728 resource metadata.
- `GET /.well-known/oauth-authorization-server`, RFC 8414 metadata, advertising `code_challenge_methods_supported: ["S256"]` and `offline_access` (the scope that triggers Claude to request a refresh token).
- `POST /oauth/register`, RFC 7591 dynamic client registration. The relayer checks every redirect URI against an allowlist (Anthropic's own callback domain, plus RFC 8252 loopback for Claude Code) rather than accepting any host, so no client can self-register an arbitrary redirect target.
- `GET /oauth/authorize`, `POST /oauth/token`, `POST /oauth/revoke`, the standard authorization-code + PKCE + refresh flow (RFC 6749/7636/7009). `/oauth/token` accepts both `application/x-www-form-urlencoded` (the spec-required content type) and `application/json`.

Unlike the explicit-header and stdio flows, the OAuth path has the relayer generate and custody a delegate key on the user's behalf, which it stores as `v1.<nonce>.<ciphertext>` under AES-256-GCM. Claude cannot hold a Sui wallet key itself, so something server-side has to sign for it. The consent screen states this plainly, and the user can revoke the delegate key from the dashboard like any other.

To add the connector in Claude, paste the relayer's MCP URL as the connector URL. Claude handles discovery, registration, and consent from there.

### When to prefer HTTP vs stdio

Prefer **stdio** when:

- the MCP host already supports local `command + args`
- you want inline `memwal_login` UX
- you do not want to paste long-lived bearer credentials into client config

Prefer **Streamable HTTP** when:

- the MCP host supports remote MCP servers and request headers cleanly
- you are wiring a shared hosted endpoint instead of a local package
- you intentionally want a config based on explicit bearer credentials

### Public routes

The hosted relayer (and any self-hosted relayer) exposes the same MCP routes:

| **Route** | **Purpose** |
| --- | --- |
| `GET /api/mcp/sse` | Legacy SSE session for the stdio bridge |
| `POST /api/mcp/messages` | JSON-RPC messages for the legacy SSE transport |
| `GET /api/mcp` | Streamable HTTP server-to-client stream |
| `POST /api/mcp` | Streamable HTTP JSON-RPC messages |
| `DELETE /api/mcp` | Close a Streamable HTTP session |
| `GET /.well-known/oauth-protected-resource` | OAuth resource metadata (RFC 9728, when configured) |
| `GET /.well-known/oauth-authorization-server` | OAuth authorization-server metadata (RFC 8414) |
| `POST /oauth/register` | Dynamic client registration (RFC 7591) |
| `GET /oauth/authorize`, `POST /oauth/token`, `POST /oauth/revoke` | Authorization-code + PKCE + refresh flow |

The Rust relayer auto-starts a TypeScript sidecar and forwards MCP traffic to it over loopback. The sidecar resolves MCP bearer credentials into normal Walrus Memory SDK sessions, so MCP tool calls go through the **same `@mysten/seal` encryption, Walrus, and pgvector paths** as direct SDK calls.

## Runtime safety notes

Two behaviors surprise people often enough to spell out: how the package treats a `401`, and what `--relayer` does to a saved credential.

### 401 behavior

If the relayer returns `401 Unauthorized`, the package surfaces a clear error but does **not** auto-delete `~/.memwal/credentials.json`.

That is intentional. A `401` can mean a revoked delegate key, but it can also come from a transient edge/proxy/network issue. Leaving the file untouched avoids turning a temporary failure into forced re-auth.

### `--relayer` override behavior

If a saved credentials file already points at one relayer and you launch the current process with a different `--relayer`, the override applies to the **current process only**.

The package does not silently rewrite the saved file. To rotate the saved relayer permanently, sign out and log in again on the target environment.

## Self-hosting

Self-hosted relayers expose the same public MCP routes as the hosted relayer. The most common operator-tunable settings:

| **Variable** | **Default** | **Purpose** |
| --- | --- | --- |
| `SIDECAR_URL` | `http://localhost:9000` | Loopback endpoint the Rust relayer uses to reach the sidecar |
| `MCP_MAX_TOTAL_SESSIONS` | `1000` | Cap on concurrent MCP sessions across SSE and Streamable HTTP |
| `MCP_MAX_SESSIONS_PER_IP` | `16` | Cap on concurrent sessions from one source IP |
| `MCP_MAX_NEW_SESSIONS_PER_IP_PER_MIN` | `30` | Rate cap on new sessions per source IP per minute |
| `TRUSTED_PROXY_HOPS` | `0` | Trusted reverse-proxy hops used to resolve the canonical client IP; keep `0` for direct deployments |

See [Environment Variables](/walrus-memory/reference/environment-variables) for the full list including `@mysten/seal` encryption, Walrus, embeddings, and database settings.

### MCP OAuth 2.1 configuration

Claude custom connector support uses OAuth 2.1. The relayer derives most values from `MEMWAL_RELAYER_URL` and requires exactly one secret. For the end-user flow, see [Claude custom connector](/walrus-memory/mcp/claude-connector).

#### Required delegate encryption key

| **Variable** | **Description** |
| --- | --- |
| `MCP_OAUTH_DELEGATE_ENCRYPTION_KEY` | AES-256-GCM key (32 bytes, base64url-encoded, no padding) |

**Why the relayer needs this key**

Claude cannot hold a Sui wallet private key itself, so the OAuth path puts a delegate key on the server instead:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```text
1. Claude sends the user to GET /oauth/authorize
2. The relayer generates an Ed25519 delegate keypair server-side
3. The relayer encrypts the private key with MCP_OAUTH_DELEGATE_ENCRYPTION_KEY
   and stores only the ciphertext (v1.<nonce>.<ciphertext>)
4. The user connects a wallet on the consent screen and signs add_delegate_key,
   which authorizes that delegate on their account onchain
5. When a request presents an OAuth access token, the relayer decrypts the
   delegate private key in memory
6. The relayer signs MCP requests with that delegate key
```

`MCP_OAUTH_DELEGATE_ENCRYPTION_KEY` is the **server's symmetric encryption key**. It encrypts and decrypts every user's delegate private key in the database.

Generate a key:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/reference.md" target="_blank" className="code-source-link">Source: mcp/reference.md</a>

```bash
$ openssl rand -base64 32 | tr -d '=' | tr '+/' '-_'
# Output example: GxK9pL2mQr8vN3jF5Ys7hT6wZ1cD4eR8
```

Three things to know about the key:

1. Generate it once and persist it. Changing the key invalidates every existing OAuth token.
2. The key never leaves the server.
3. The relayer encrypts delegate private keys at rest and decrypts them in memory only to sign.

:::warning
The OAuth path is the only Walrus Memory flow where a server holds a delegate private key. The stdio and explicit-header flows keep the key on the client. Operators who cannot accept server-side key custody should leave `MCP_OAUTH_DELEGATE_ENCRYPTION_KEY` unset, which turns the OAuth routes off and leaves header authentication working.
:::

#### Derived values

The relayer computes these, so they need no configuration.

| **From** | **Value** |
| --- | --- |
| `MEMWAL_RELAYER_URL` | `issuer` |
| `issuer + "/api/mcp"` | `resource` |
| `issuer`, with the `relayer.` label dropped, plus `/connect/claude` | `consent_url` |

#### Optional overrides

| **Variable** | **Default** | **Description** |
| --- | --- | --- |
| `MCP_OAUTH_ACCESS_TTL_SECS` | `3600` | Access token lifetime |
| `MCP_OAUTH_REFRESH_TTL_SECS` | `2592000` | Refresh token lifetime (30 days) |
| `MCP_OAUTH_CODE_TTL_SECS` | `300` | Authorization code lifetime |
| `MCP_OAUTH_SESSION_TTL_SECS` | `900` | OAuth session lifetime |
| `MCP_OAUTH_ALLOWED_REGISTRATION_HOSTS` | `claude.ai` | Redirect URI allowlist |
| `MCP_OAUTH_REGISTRATION_PER_HOUR_PER_IP` | `20` | DCR rate limit |
| `MCP_OAUTH_REGISTRATION_TRUSTED_CIDRS` | `160.79.104.0/21` | Networks exempt from the per-IP registration throttle. Requests from other addresses still register when the redirect URI passes the allowlist and they stay inside the rate limit. The default is Anthropic's documented connector egress range. |

## Logout semantics

`memwal_logout` and `--logout` only delete local credentials from this machine.

They do **not**:

- revoke the onchain delegate key
- remove the delegate from the Walrus Memory dashboard

If the delegate itself should stop working, revoke it from the dashboard too.

## Troubleshooting

Work through the symptom that matches what you see.

### Tools aren't visible to the agent

Quit and relaunch your MCP client. MCP servers only load at startup. If you used `claude mcp add`, run `claude mcp list` to confirm `memwal` is registered before restarting Claude Code.

### Only `memwal_login` shows up

Credentials are missing. Ask the agent to call `memwal_login`, or run `npx -y @mysten-incubation/memwal-mcp login --prod` from your terminal.

### `memwal_login` URL expires before approval

The URL is valid for **5 minutes**. Call the tool again to mint a fresh one. Make sure your browser is logged into the wallet you intend to use before clicking.

### Recall returns `no matching memories found` right after a remember

By default `memwal_remember` returns at accept (`job_id`, ~1s). At that point the server has **not stored the memory yet**; the Walrus write is still in flight. Expect an empty recall immediately after accept. Settle with the job-status tool this server advertises (`memwal_remember_status` on a current sidecar) and only treat `blob_id` as saved. `MEMWAL_MCP_REMEMBER_WAIT_MS=90000` is the opt-in wait-for-`blob_id` path (needs a client that raises the 60s tools/call ceiling).

### 401 unauthorized from the relayer

Someone revoked your delegate key from the dashboard, or your saved credentials point at the wrong environment. Run `--logout` then `login --<env>` for the env you want.

### Verbose logs for debugging

Set `MEMWAL_MCP_DEBUG=1` in the client's MCP server config `env` block (or in your terminal) to dump structured stderr logs covering credential loading, bridge connection, and per-request flow.

## Remember wait time

`MEMWAL_MCP_REMEMBER_WAIT_MS` sets how long `memwal_remember` waits for the Walrus write to finish before it replies. The default is 0: the tool returns at accept with a `job_id`, before the memory is stored. You can raise the value up to the tool's `MAX_REMEMBER_WAIT_MS` cap. The stdio package gives `memwal_remember` a 90_000 ms deadline to match that cap. Setting `MEMWAL_MCP_REMEMBER_WAIT_MS=90000` makes the tool wait for `blob_id`. This requires a client that raises the 60s `tools/call` ceiling.

## Settle a remember job with `memwal_remember_status`

A current sidecar also advertises `memwal_remember_status`. By default, `memwal_remember` returns at accept with a `job_id` before the Walrus write finishes, so an empty recall right after accept is expected. Pass that `job_id`, or several as `job_ids`, to `memwal_remember_status`. The tool requires one of the two and returns an error if you omit both. Optional `waitMs` sets how long the call waits, and its ceiling stays under the 60s MCP client request deadline.

While the job is queued or uploading, the reply starts with `STILL UPLOADING`, includes the `job_id` and the job state, and asks you to call the tool again with the same `job_id`. Do not re-send the fact with `memwal_remember`, because that queues a duplicate. Treat a fact as saved only after the job returns a `blob_id`. A failed, timed-out, or unknown job returns an error that names the condition.
