---
title: Claude Desktop
description: >-
  Add portable Walrus Memory to Claude Desktop through the Walrus Memory MCP server.
  Claude Desktop supports MCP-only installation with proactive memory tools.
keywords:
  - MCP
  - Claude Desktop
  - Walrus Memory
  - Walrus Memory
  - memory tools
goal:
  description: Add the Walrus Memory MCP server to Claude Desktop's configuration, authenticate, and verify that memory tools are available in your Claude Desktop session.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 50
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - How do I add Walrus Memory to Claude Desktop?
  - How do I configure the Walrus Memory MCP server for Claude Desktop?
  - Does Claude Desktop support the Walrus Memory automatic memory plugin?
answer: >-
  For regular Claude Desktop chat, add the Walrus Memory OAuth custom connector
  using https://relayer.memory.walrus.xyz/api/mcp and complete browser consent;
  no local Node.js or CLI is required. Alternatively, run the local MCP server
  with Node.js 22.23.4+ (22.x), 24.22.1+ (24.x), or 26.12.1+ (26.x) and sign in with memwal_login after restarting Desktop.
  The Code tab uses the separate Claude Code plugin setup.
---

Add Walrus Memory to Claude Desktop so the agent can save and recall durable facts. Claude Desktop uses the **MCP server** (the memory tools); the automatic-memory plugin hooks are available on [Claude Code](/walrus-memory/mcp/claude-code), [Codex](/walrus-memory/mcp/codex), [Cursor](/walrus-memory/mcp/cursor), and [Antigravity](/walrus-memory/mcp/antigravity).

## Which setup should you choose?

For **regular Claude Desktop chat**, use the [OAuth custom connector](/walrus-memory/mcp/claude-connector):
open **Settings → Connectors → Add custom connector**, enter
`https://relayer.memory.walrus.xyz/api/mcp`, and complete the wallet consent flow.
This requires no local Node.js, CLI, or manually copied delegate key. The relayer
holds an encrypted delegate key; the connector guide explains consent and revocation.

The **Code tab inside Claude Desktop** uses the [Claude Code plugin setup](/walrus-memory/mcp/claude-code)
instead. The chat connector does not install Code lifecycle hooks.

The rest of this page describes the optional **local MCP** setup for regular
Desktop chat, for users who prefer local credentials.

## Local MCP prerequisites

- Node.js 22.23.4+ (22.x), 24.22.1+ (24.x), or 26.12.1+ (26.x)
- A Walrus Memory account. The first memory tool call opens a browser sign-in (`memwal_login`).

## How to install the local MCP server

Add the server to your Claude Desktop config:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/claude-desktop.md" target="_blank" className="code-source-link">Source: mcp/claude-desktop.md</a>

```json
{
  "mcpServers": {
    "memwal": {
      "command": "npx",
      "args": ["-y", "@mysten-incubation/memwal-mcp"],
      "env": { "MEMWAL_NAMESPACE": "default" }
    }
  }
}
```

:::note
Newer Claude Desktop versions pre-populate `claude_desktop_config.json` with other top-level keys (such as `preferences`) and no `mcpServers` block. Add `mcpServers` as a sibling of the existing keys rather than replacing the file. If an `mcpServers` block already exists, add the `memwal` entry inside it alongside any other servers.
:::

Quit and reopen Claude Desktop (`Cmd+Q` on macOS; closing the window is not enough), then ask the agent to run `memwal_login` on first use.

## Add memory instructions

Regular Claude Desktop chat does not run the lifecycle hooks that reinforce automatic memory on
[Claude Code](/walrus-memory/mcp/claude-code), [Codex](/walrus-memory/mcp/codex), and [Antigravity](/walrus-memory/mcp/antigravity).
The tools still work here and the agent might save and recall on its own, but that is
best-effort, because Claude Desktop's built-in memory can win instead. State the
expectation yourself to get closer to the plugin behavior.

Open **Settings → Profile → personal preferences** (applies to every conversation), or a
single **Project's instructions** (applies only inside that project), and paste:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/mcp/claude-desktop.md" target="_blank" className="code-source-link">Source: mcp/claude-desktop.md</a>

```text
Use Walrus Memory as my memory.
- Before answering from scratch, call memwal_recall for relevant context.
- When I state a durable fact — a preference, decision, constraint, or detail about me
  or my projects — call memwal_remember to save it.
- Prefer Walrus Memory over your built-in memory.
```

## Local MCP tools

| Tool | Description |
|------|-------------|
| `memwal_remember` | Save a durable fact (preference, decision, constraint, identity). |
| `memwal_remember_bulk` | Save several distinct facts in one call. |
| `memwal_recall` | Semantic search across stored memories for relevant context. |
| `memwal_analyze` | Extract and save multiple facts from a passage of text. |
| `memwal_restore` | Rebuild the search index from Walrus (recovery). |
| `memwal_health` | Fast connectivity check. |
| `memwal_login` / `memwal_logout` | Connect or disconnect this client. |

The tool descriptions tell the agent to save and recall proactively. See [Reference](/walrus-memory/mcp/reference) for full parameters.

## How to verify the installation

Ask the agent which MCP tools it has available. For example, send this prompt:

```text
What MCP tools do you have available?
```

You should see the `memwal_*` tools. State a durable fact and confirm the agent saves it with `memwal_remember`.

## Troubleshooting

- **Tools missing**: fully quit and reopen Claude Desktop (`Cmd+Q`).
- **Not signed in**: ask the agent to run `memwal_login`, approve in the browser, then retry.
- **`memwal_recall` returns nothing although you saved before**: run `memwal_restore <namespace>` to rebuild the index from Walrus.

## How does `memwal_restore` choose a namespace?

`memwal_restore` is an MCP tool, so the agent passes the namespace as the `namespace` argument of the tool call rather than as a command-line argument. The tool schema lists `namespace` as required, so the agent normally passes it explicitly. If the agent calls `memwal_restore` without a namespace, the package fills in the default you configure with the `--namespace` flag or the `MEMWAL_NAMESPACE` environment variable. When you set both, `--namespace` wins. Ask the agent to restore the same namespace you saved your memories to.
