// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for generate-release-notes.js.
 *
 * Run: node --test src/scripts/test-release-notes.js
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  extractLinkedChanges,
  memwalDisplayName,
} = require("./generate-release-notes.js");

const RELEASE_URL =
  "https://github.com/MystenLabs/walrus-memory/releases/tag/x%400.0.1";

test("memwalDisplayName names every Walrus Memory package", () => {
  assert.equal(
    memwalDisplayName("@mysten-incubation/memwal"),
    "Walrus Memory TypeScript SDK",
  );
  assert.equal(
    memwalDisplayName("@mysten-incubation/memwal-mcp"),
    "Walrus Memory MCP",
  );
  assert.equal(memwalDisplayName("memwal-python"), "Walrus Memory Python SDK");
  assert.equal(
    memwalDisplayName("@mysten-incubation/oc-memwal"),
    "Walrus Memory OpenClaw",
  );
  assert.equal(memwalDisplayName("@mysten-incubation/other"), "other");
});

test("linked bullets win and the fallback is not used", () => {
  const body = [
    "## 0.1.0",
    "",
    "- Add a status subcommand. (#1340)",
    "- Plain bullet without a reference.",
  ].join("\n");
  assert.deepEqual(
    extractLinkedChanges(body, "MystenLabs/MemWal", { fallbackUrl: RELEASE_URL }),
    [
      {
        text: "Add a status subcommand.",
        url: "https://github.com/MystenLabs/MemWal/pull/1340",
      },
    ],
  );
});

test("without a fallback URL, unlinked bullets produce no changes", () => {
  const body = "## 0.1.13\n\n### Fixed\n\n- Something changed. (Refs #978)\n";
  assert.deepEqual(extractLinkedChanges(body, "MystenLabs/MemWal"), []);
});

test("falls back to plain top-level bullets linked to the release", () => {
  const body = [
    "## 0.0.5",
    "",
    "### Patch Changes",
    "",
    "- Fix unresolvable `workspace:*` dependency in the published package. The release",
    "  workflow used `npm publish`.",
    "- **Config**: see [the docs](https://example.com/docs).",
    "- Updated dependencies [abc1234]",
    "  - @mysten-incubation/memwal@0.1.10",
    "",
    "```",
    "- not a change",
    "```",
  ].join("\n");
  assert.deepEqual(
    extractLinkedChanges(body, "MystenLabs/MemWal", { fallbackUrl: RELEASE_URL }),
    [
      {
        text:
          "Fix unresolvable `workspace:*` dependency in the published package. " +
          "The release workflow used `npm publish`.",
        url: RELEASE_URL,
      },
      { text: "Config: see the docs.", url: RELEASE_URL },
    ],
  );
});
