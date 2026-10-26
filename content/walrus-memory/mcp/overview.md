---
title: MCP
description: >-
  Portable, verifiable agent memory for any MCP client, as a plain MCP server or as a plugin with automatic memory.
  Works with Claude Code, Codex, Cursor, Antigravity, Claude Desktop, and OpenCode.
keywords:
  - MCP
  - Walrus Memory
  - Walrus Memory
  - plugin
  - automatic memory
  - agent memory
goal:
  description: Choose between the plugin installation path (with automatic before/after hooks) and the MCP-only path, then navigate to the correct client-specific setup guide for your AI tool.
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
  - What is the Walrus Memory MCP server and how does it work?
  - What is the difference between the Walrus Memory plugin and MCP-only installation?
  - Which MCP clients support the Walrus Memory automatic memory plugin?
answer: >-
  The Walrus Memory MCP server exposes portable Walrus Memory as Model Context Protocol tools so AI agents can save and recall memories on their own. You can install it as a plugin (with lifecycle hooks for automatic memory) on Claude Code, Codex, Cursor, and Antigravity, or as an MCP-only server on any MCP-aware client. Available tools include memwal_remember, memwal_recall, memwal_analyze, memwal_restore, memwal_health, memwal_login, and memwal_logout.
---

<AgentPrompt
  prompt="Add the Walrus Memory MCP server to this client. On Claude Code run `claude mcp add --scope user memwal -- npx -y @mysten-incubation/memwal-mcp`; on other clients add the equivalent mcp.json entry. Then ask the agent to run memwal_login to sign in."
/>

The **Walrus Memory MCP server** exposes your portable Walrus Memory as Model Context Protocol tools, so an AI agent can decide when to save and recall memories on its own. It works with any MCP-aware client, and on **Claude Code**, **Codex**, **Cursor**, and **Antigravity** you can install it as a **plugin** that adds automatic memory through lifecycle hooks.

If you already have local memory, standing context, or session history, [import those facts](/walrus-memory/guides/import-existing-memory) so the account starts with what you have.

## MCP vs plugin

There are two ways to use Walrus Memory. The difference is whether you also get the **lifecycle hooks**:

| Component | **Plugin** | **MCP-only** |
|---|:-:|:-:|
| Walrus Memory MCP: memory tools (`memwal_remember`, `memwal_recall`, …) | ✓ | ✓ |
| Lifecycle hooks: automatic recall and save reminders | ✓ | ✗ |

- **Plugin:** Bundles the MCP server **and** lifecycle hooks. The `SessionStart` hook tells the agent to prefer the `memwal_*` tools over any built-in or local memory feature, and when to save without being asked. Available on **Claude Code**, **Codex**, **Antigravity**, and **Cursor**.
- **MCP-only:** Gives the agent the memory tools on **every** MCP client. The tool descriptions encourage proactive use, so agents often do save and recall on their own. Treat that as best-effort: it varies by client and model, and on a client that ships its own memory feature the built-in one commonly wins.

Saving **without being asked is on once you agree to it**: `memwal-mcp login`
asks the question in your terminal the first time, and on a fresh install
the agent saves nothing unprompted until you answer. Saved memories are permanent
(Walrus is immutable storage), which is why the question comes first. Change the
answer any time with `memwal-mcp auto-save on|off` (or `MEMWAL_AUTO_SAVE` in
your client's `env` block). Recall, and anything you explicitly ask the agent to
remember, work either way. Both modes exclude credentials, passwords, API keys, tokens, private keys, seed
phrases, authorization headers, and URLs with an embedded `user:password`.
Walrus Memory strips them before writing a memory, because Walrus
storage is append-only and you cannot delete a stored secret.

:::tip
Prefer the plugin wherever you can install it. It is the tested path for reliable automatic save and recall, and it needs no extra instructions from you. On MCP-only clients, paste the client's instruction block (see [Claude Desktop](/walrus-memory/mcp/claude-desktop#add-memory-instructions)) to get closer to the same behavior.
:::

## Fastest path: let your agent set it up

Paste this into the AI client you want to connect:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/overview.md" target="_blank" className="code-source-link">Source: mcp/overview.md</a>

```text
Run `curl -sL https://memory.walrus.xyz/skills/setup` and use the returned
instructions to connect Walrus Memory to this AI client.
```

The agent identifies the client, writes the right config or runs the right install
command, signs you in, and verifies the memory tools. To do it by hand, use the table in
[Which install path for your client](#which-install-path-for-your-client).

## Which install path for your client

What you do differs per client. Pick your row:

| Client | Automatic memory (hooks) | What you do |
|---|:-:|---|
| [Claude Code](/walrus-memory/mcp/claude-code) | ✓ Plugin | Code tab: use the [Claude Code plugin setup](/walrus-memory/mcp/claude-code) with the explicit HTTPS marketplace URL; regular Claude Desktop or web chat: use the [OAuth connector](/walrus-memory/mcp/claude-connector) |
| [Codex](/walrus-memory/mcp/codex) | ✓ Plugin | `codex plugin marketplace add MystenLabs/MemWal`, then `codex plugin add memwal@memwal-plugins`, then trust the hooks through `/hooks` |
| [Antigravity](/walrus-memory/mcp/antigravity) | ✓ Plugin | `npx degit MystenLabs/MemWal/packages/mcp/plugin ~/.gemini/config/plugins/memwal` |
| [Cursor](/walrus-memory/mcp/cursor) | ✓ Plugin | `npx -y degit MystenLabs/MemWal/packages/mcp/plugin ~/.cursor/plugins/local/memwal` |
| [Claude Desktop](/walrus-memory/mcp/claude-desktop) | ✗ MCP-only | Regular chat: use the [OAuth connector](/walrus-memory/mcp/claude-connector); local MCP is optional. The Code tab uses [Claude Code](/walrus-memory/mcp/claude-code). |
| [OpenCode](/walrus-memory/mcp/opencode) | ✗ MCP-only | Edit the OpenCode MCP config |
| ChatGPT desktop app | ✓ Plugin | Ships Codex, so follow [Codex](/walrus-memory/mcp/codex) |
| ChatGPT web (Connectors) | ✗ Not supported | n/a |

On the plugin rows, that command is the whole setup. The plugin's hooks carry the memory
instructions, so you do not need to add routing text to `CLAUDE.md`, `AGENTS.md`, or a
system prompt yourself.

:::info
**ChatGPT means two different things here.** The macOS **ChatGPT desktop app** ships
Codex (`/Applications/ChatGPT.app/Contents/Resources/codex`) and reads the same
`~/.codex/config.toml`, so the [Codex](/walrus-memory/mcp/codex) plugin install works there unchanged.

**Walrus Memory does not support ChatGPT web connectors.** Walrus Memory's remote
[Streamable HTTP transport](/walrus-memory/mcp/reference#transports) needs two custom headers, but the
Connectors UI exposes only a single bearer field and cannot supply the required
`x-memwal-account-id` header.
:::

## Available tools

| Tool | Description |
|------|-------------|
| `memwal_remember` | Save a durable fact for the user (preference, decision, constraint, identity). |
| `memwal_remember_bulk` | Save several distinct facts in one call. |
| `memwal_recall` | Semantic search across stored memories for relevant context. |
| `memwal_analyze` | Extract and save multiple facts from a passage of text. |
| `memwal_restore` | Rebuild the search index from Walrus when recall is unexpectedly empty. |
| `memwal_health` | Fast connectivity check (no search or decryption). |
| `memwal_login` | Connect this client to your account through browser wallet sign-in. |
| `memwal_logout` | Remove the saved credentials from this machine. |

`memwal_recall` prints both `score = 1 - cosine distance` (higher = more similar) and the raw `distance` (lower = more similar), which is the wire and SDK field. Its optional `maxDistance` cutoff uses `distance`, not `score`.

See [Reference](/walrus-memory/mcp/reference) for full parameters, CLI flags, and transports.

## How it works

The npm package (`@mysten-incubation/memwal-mcp`) runs locally next to your MCP client and bridges every memory tool call to the Walrus Memory relayer, which handles embeddings, Seal encryption, and Walrus storage.

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/overview.md" target="_blank" className="code-source-link">Source: mcp/overview.md</a>

```mermaid
flowchart TD
  A["MCP client starts memwal-mcp"] --> B{"~/.memwal/credentials.json exists?"}
  B -- "No" --> C["Auth-required mode: agent calls memwal_login"]
  C --> D["Browser opens wallet sign-in"]
  D --> E["Credentials saved to ~/.memwal/credentials.json"]
  E --> F["Bridged mode"]
  B -- "Yes" --> F
  F --> G["Memory tools forwarded to the relayer<br/>(embeddings · SEAL encryption · Walrus storage)"]
```

- **First run (no credentials):** the server still starts and exposes `memwal_login`, so the agent signs you in inline instead of failing with a vague startup error. The login tool returns a clickable URL (valid 5 minutes); after you approve in the browser, the next tool call picks up the credentials automatically.
- **Credential file:** login writes `~/.memwal/credentials.json` (mode `0600`) containing your delegate key and account metadata. The delegate private key is a sensitive, long-lived credential; treat it like an API key.
- **Local vs remote tools:** the package handles `memwal_login` and `memwal_logout` locally (they never reach the relayer) and forwards all memory tools (`memwal_remember`, `memwal_recall`, …) to the relayer over an authenticated session.
- **Logout:** deletes only the local credential file. To fully revoke access, also remove the delegate key from the dashboard.

See [Reference](/walrus-memory/mcp/reference) for the credential file contents, transports (stdio vs HTTP), and runtime safety details.

## Client-specific setup

<Cards>
  <Card title="Claude Code" href="/walrus-memory/mcp/claude-code">
    Plugin (automatic memory) or MCP-only
  </Card>
  <Card title="Codex" href="/walrus-memory/mcp/codex">
    Plugin (automatic memory) or MCP-only
  </Card>
  <Card title="Cursor" href="/walrus-memory/mcp/cursor">
    Plugin or MCP-only
  </Card>
  <Card title="Claude Desktop" href="/walrus-memory/mcp/claude-desktop">
    MCP-only
  </Card>
  <Card title="Antigravity" href="/walrus-memory/mcp/antigravity">
    Plugin or MCP-only
  </Card>
  <Card title="OpenCode" href="/walrus-memory/mcp/opencode">
    MCP-only
  </Card>
  <Card title="Reference" href="/walrus-memory/mcp/reference">
    Tools, CLI flags, transports, self-hosting
  </Card>
</Cards>

## Verify your setup

Ask the agent in any conversation:

> What MCP tools do you have available?

You should see the `memwal_*` tools. Then state a durable fact (for example, a preferred package manager) and confirm the agent saves it with `memwal_remember` and recalls it in a later session.

## Quick recovery

If `memwal_recall` returns nothing although you saved before (a new machine, a fresh relayer, or after switching servers), run `memwal_restore <namespace>` to rebuild the search index from the durable Walrus blobs, then recall again.
