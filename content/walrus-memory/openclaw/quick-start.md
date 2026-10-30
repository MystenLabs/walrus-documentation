---
title: "Quick Start"
description: >-
  Install the Walrus Memory plugin for NemoClaw or OpenClaw and verify it works.
  Covers prerequisites, installation, credential setup, configuration, and end-to-end testing.
keywords:
  - OpenClaw
  - Walrus Memory
  - Walrus Memory
  - quick start
  - installation
  - plugin setup
goal:
  description: Install the OpenClaw Walrus Memory plugin, connect it to your account, and run a test conversation to confirm automatic recall and save are working.
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
  - How do I install the Walrus Memory plugin for OpenClaw?
  - How do I configure the Walrus Memory OpenClaw plugin with my delegate key?
  - How do I verify that the OpenClaw memory plugin is working?
answer: >-
  Install the Walrus Memory OpenClaw plugin with openclaw plugins install @mysten-incubation/oc-memwal. Configure it in ~/.openclaw/openclaw.json with your delegate key (through the MEMWAL_PRIVATE_KEY environment variable), account ID, and relayer URL. Restart the gateway and verify by running openclaw memwal stats, then test the memory loop by storing a fact in one conversation and recalling it in another.
---

Get the plugin running and test the memory loop in a few minutes.

<div className="outlined-tabs">

<Tabs>
<TabItem value="prereq" label="Prerequisites">

- [x] [OpenClaw](https://openclaw.ai) `>=2026.3.11` installed and running

</TabItem>
</Tabs>

</div>

You also need a **delegate key**, **account ID**, and **relayer URL** from Walrus Memory. [Get your Walrus Memory credentials](#get-your-walrus-memory-credentials) explains how to get these.


### Install the plugin

    ```bash
    openclaw plugins install @mysten-incubation/oc-memwal
    ```

  ### Get your Walrus Memory credentials

    The plugin needs three values to connect to Walrus Memory:

    | Value | What it is |
    |-------|-----------|
    | **Delegate key** | A private key (64-character hex) used to sign requests and encrypt memories |
    | **Account ID** | Your MemWalAccount object ID on Sui (`0x...`) |
    | **Relayer URL** | The Walrus Memory relayer endpoint that handles search, storage, and encryption |

    The easiest way to get your delegate key and account ID is through the [Walrus Memory dashboard](https://memory.walrus.xyz). See the [main Quick Start](/walrus-memory/getting-started/quick-start) for detailed setup instructions.

    For the relayer URL, use a managed endpoint or deploy your own:

    | Environment | Relayer URL |
    |-------------|-------------|
    | **Production** (Mainnet) | `https://relayer.memory.walrus.xyz` |
    | **Staging** (Testnet) | `https://relayer-staging.memory.walrus.xyz` |

    :::info
Walrus Foundation provides these managed relayer endpoints as a public good.
:::

  ### Set your delegate key

    Store your delegate key as an environment variable so you never hardcode it in config files:

    ```bash
    # Add to your shell profile (.zshrc, .bashrc, etc.)
    export MEMWAL_PRIVATE_KEY="your-64-char-hex-key"
    ```

  ### Configure OpenClaw

    Add the plugin config to `~/.openclaw/openclaw.json`:

    ```jsonc
    {
      "plugins": {
        "slots": { "memory": "memory-memwal" },
        "entries": {
          "memory-memwal": {
            "enabled": true,
            // Required for auto-capture. OpenClaw blocks the agent_end hook for
            // non-bundled plugins unless conversation access is granted here.
            "hooks": { "allowConversationAccess": true },
            "config": {
              "privateKey": "${MEMWAL_PRIVATE_KEY}",           // References the env var
              "accountId": "0x3247e3da...",                     // Your account ID from the dashboard
              "serverUrl": "https://relayer-staging.memory.walrus.xyz"     // Or your self-hosted relayer
            }
          }
        }
      }
    }
    ```

    :::warning
The config key is `memory-memwal`, the plugin's manifest ID, not the npm
    package name `oc-memwal`. The installer reports this as
    `using manifest id as the config key`. Using `oc-memwal` leaves the plugin
    unbound, and it never loads.

    `hooks.allowConversationAccess` is equally load-bearing. Without it, OpenClaw
    logs `typed hook "agent_end" blocked` at startup and **auto-capture silently
    never runs**, even though the gateway reports the plugin as connected.
:::

    <details>
<summary>Optional settings</summary>

You can add these to the `config` block to tune behavior. The defaults work well for most setups.

      | Option | Default | Description |
      |--------|---------|-------------|
      | `autoRecall` | `true` | Inject relevant memories before each turn |
      | `autoCapture` | `true` | Extract and store facts after each turn |
      | `maxRecallResults` | `5` | Maximum memories to inject per turn |
      | `minRelevance` | `0.3` | Relevance threshold (0-1) for memory injection |
      | `captureMaxMessages` | `10` | How many recent messages to analyze for facts |
      | `defaultNamespace` | `"default"` | Memory scope for the main agent |
      | `requestTimeoutMs` | `10000` | Deadline in ms for each relayer call. Raise it for a slow self-hosted relayer. |

</details>

  ### Start OpenClaw

    ```bash
    openclaw gateway stop && openclaw gateway
    ```

    You should see in the logs:

    ```
    memory-memwal: registered (server: https://..., key: e21d...ed9b, namespace: default)
    memory-memwal: connected (status: ok, version: ...)
    ```

    :::tip
If you see `health check failed`, check that your relayer URL is reachable and that you set the `MEMWAL_PRIVATE_KEY` environment variable.
:::


### Check connectivity

Run the stats command to confirm the plugin is connected:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```bash
$ openclaw memwal stats
```

This shows the relayer status, your key (masked), account ID, active namespace, and whether auto-recall and auto-capture are enabled.

### Test the memory loop

The core value of the plugin is the automatic recall and capture cycle. Test it end-to-end:

**1. Store a fact**, start a conversation and share something memorable:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```
You: I prefer TypeScript over JavaScript for backend work
Bot: (responds normally)
```

Check logs, you should see:
<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```
memory-memwal: auto-captured 1 facts (agent: main, namespace: default)
```

**2. Recall it**, in a **new conversation**, ask about it:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```
You: What programming languages do I like?
```

Check logs, you should see:
<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```
memory-memwal: auto-recall injected 1 memories (agent: main, namespace: default)
```

**3. Search from terminal**, confirm the memory exists through CLI:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```bash
$ openclaw memwal search "programming"
```

If all three steps work, the plugin is fully operational.

### Enable LLM tools (optional)

By default, the plugin works entirely through hooks, and the large language model (LLM) doesn't know about memory tools. To give the LLM explicit control, add tools to your agent profile:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/openclaw/quick-start.md" target="_blank" className="code-source-link">Source: openclaw/quick-start.md</a>

```json
{
  "tools": {
    "allow": ["memory_search", "memory_store"]
  }
}
```

Then the LLM can call `memory_search` and `memory_store` on its own when it decides to. This is a power-user feature, hooks handle the common case automatically.

## Next steps

- [How It Works](/walrus-memory/openclaw/how-it-works), understand the architecture, message flow, and hook mechanics
- [Reference](/walrus-memory/openclaw/reference), detailed breakdown of hooks, tools, CLI, and configuration

## Troubleshoot missing auto-capture

If `openclaw memwal stats` reports the plugin as connected but the logs never show `auto-captured`, check the following:

- Confirm `autoCapture` is `true` in the `config` block. This is the default.
- Share a substantive fact. Capture skips trivial messages, such as messages under 30 characters and filler replies like ok or thanks.
- Search the logs for `auto-capture skipped` or `auto-capture failed` messages.
- Search the startup logs for `typed hook "agent_end" blocked`, which means `hooks.allowConversationAccess` is missing. See [Configure OpenClaw](#configure-openclaw).

## Which config key sets the relayer URL?

The plugin reads the relayer URL from the `serverUrl` field in the `config` block. Only `privateKey` expands `${ENV_VAR}` references. The plugin keeps `serverUrl` and every other field literal, so a secret cannot land in `serverUrl`. Write the full relayer URL as the value instead of an environment variable reference.
