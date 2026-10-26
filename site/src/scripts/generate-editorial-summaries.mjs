// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0

/**
 * Writes an editorial summary into editorial/ for every release that has
 * none, from the JSON that check-editorial-coverage.js --json produces.
 *
 * A release whose GitHub body has content gets a summary drafted by Claude in
 * the house format, for a human to review in the pull request the
 * editorial-summaries workflow opens. A release with no content beyond the
 * Full Log link gets the fixed maintenance-release text, with no model call.
 *
 * Run: node src/scripts/generate-editorial-summaries.mjs [options]
 *   --missing <path>   JSON from check-editorial-coverage.js --json; without it
 *                      the checker runs first (needs GITHUB_TOKEN)
 *   --max <n>          draft at most <n> releases this run, newest first
 *   --skeleton         write the TODO skeleton instead of calling the model
 *   --model <id>       model to draft with (default: claude-opus-5-5)
 *
 * Needs ANTHROPIC_API_KEY unless --skeleton is set or nothing has content.
 * A release the model declines or fails on is skipped and reported; it stays
 * uncovered and is picked up again on the next run.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(here, "../../..");
const EDITORIAL_DIR = path.join(REPO_ROOT, "editorial");
const DEFAULT_MODEL = "claude-opus-5-5";
const WRAP = 100;

// ── CLI args ───────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { model: DEFAULT_MODEL, max: Infinity, skeleton: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--missing") args.missing = argv[++i];
    else if (a === "--max") args.max = parseInt(argv[++i], 10);
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--skeleton") args.skeleton = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

// Without --missing, run the coverage checker first and read its output.
function findMissing(args) {
  if (args.missing) return args.missing;
  const out = path.join(os.tmpdir(), "editorial-missing.json");
  const checker = path.join(here, "check-editorial-coverage.js");
  const result = spawnSync(process.execPath, [checker, "--limit", "50", "--json", out], {
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error("check-editorial-coverage.js failed");
  return out;
}

// ── House format ───────────────────────────────────────────────────

function formatDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function wrap(text, width = WRAP) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const words = paragraph.replace(/\s+/g, " ").trim().split(" ");
      const lines = [];
      let line = "";
      for (const word of words) {
        if (line && (line + " " + word).length > width) {
          lines.push(line);
          line = word;
        } else {
          line = line ? line + " " + word : word;
        }
      }
      if (line) lines.push(line);
      return lines.join("\n");
    })
    .join("\n\n");
}

function yamlString(value) {
  return JSON.stringify(value);
}

// A description longer than the editorconfig line limit is emitted as a folded
// YAML scalar (`>-`) wrapped at the house width, like the hand-written files.
function yamlDescription(value) {
  const line = `description: ${yamlString(value)}`;
  if (line.length <= WRAP) return line;
  return "description: >-\n" + wrap(value, WRAP - 2).split("\n").map((l) => "  " + l).join("\n");
}

function productKeyword(entry) {
  // Mirrors the keyword check-editorial-coverage.js puts in its drafts.
  const slug = path.basename(entry.editorialFile, ".md");
  return slug.replace(/-v\d+\.\d+\.\d+$/, "");
}

const PRODUCT_TITLES = {
  "Walrus Memory mcp": "Walrus Memory MCP",
  "Walrus Memory sdk": "Walrus Memory TypeScript SDK",
  "Walrus Memory python": "Walrus Memory Python SDK",
  "Walrus Memory openclaw": "Walrus Memory OpenClaw",
};

function renderFile(entry, description, summary) {
  const title = `${PRODUCT_TITLES[entry.product] ?? entry.product} v${entry.version}`;
  // Walrus releases are network-paired, so the line and keywords name the
  // network. Product releases (Walrus Memory packages, Walrus Sites) carry
  // the product label in `network`; the house format shows only the date.
  const paired = entry.network !== entry.product;
  const keywords = [productKeyword(entry), "release notes", "changelog"];
  if (paired) keywords.push(entry.network.toLowerCase());
  const dateLine = paired
    ? `**${entry.network}** | ${formatDate(entry.date)}`
    : `**${formatDate(entry.date)}**`;
  return [
    "---",
    `title: ${yamlString(title)}`,
    yamlDescription(description),
    `keywords: [${keywords.map(yamlString).join(", ")}]`,
    "---",
    "",
    dateLine,
    "",
    wrap(summary),
    "",
  ].join("\n");
}

const MAINTENANCE_SUMMARY =
  "A maintenance release with no user-facing changes documented in the release notes; see the " +
  "full commit log for internal updates.";

// ── Drafting ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You write the editorial summary for one software release on the Walrus
documentation site's release notes page. The reader is a developer or storage node operator
deciding whether the release matters to them.

Write from the release body you are given. Do not add facts that are not in it, do not speculate
about motivation, and do not mention pull request numbers, commit hashes, or links; the page lists
the linked changes separately below your summary.

Leave out anything addressed to maintainers rather than users: publishing steps, version pins to
retarget, "unreleased" status, CI or packaging details. If, after that, the body announces a version
without describing any user-facing change, reply with exactly NO_CHANGES and nothing else. Never
write a summary about the release notes being thin; the page has fixed text for that case.

Style, from the Sui Documentation Style Guide:
- US English, present tense, active voice, second person where a reader is addressed.
- Plain statements. No marketing language, no exclamation marks, no "we are excited".
- Do not use "e.g.", "i.e.", or "etc."; write "for example", "that is", or rephrase.
- Use "might" rather than "may", "through" rather than "via", and "because" rather than a causal "since".
- Oxford commas.
- Do not begin a sentence with "Note".
- Name config flags, CLI options, metrics, and API names in backticks exactly as the release body spells them.

Return exactly this shape and nothing else:

DESCRIPTION: <one sentence, at most 160 characters, stating the main change>

SUMMARY:
<one or two short paragraphs, 40 to 120 words in total, covering the developer- or
operator-facing changes in order of importance; say explicitly when no operator action is
required if the body says so>`;

function userPrompt(entry) {
  const parts = [
    `Product: ${entry.product}`,
    `Version: ${entry.version}`,
    `Network: ${entry.network}`,
    `Tag: ${entry.tag}`,
    "",
    "Release body:",
    "",
    entry.body.trim(),
  ];
  const paired = (entry.pairedBody || "").trim();
  if (paired && paired !== entry.body.trim()) {
    parts.push(
      "",
      `Release body of the paired ${entry.pairedNetwork} release of the same version:`,
      "",
      paired,
    );
  }
  return parts.join("\n");
}

function parseDraft(text) {
  if (text.trim() === "NO_CHANGES") return null;
  const match = text.match(/DESCRIPTION:\s*(.+?)\s*\n+SUMMARY:\s*\n([\s\S]+)$/);
  if (!match) throw new Error("model output did not match the DESCRIPTION/SUMMARY shape");
  const description = match[1].replace(/\s+/g, " ").trim();
  const summary = match[2].trim();
  if (description.length > 200) throw new Error(`description is ${description.length} characters`);
  if (summary.split(/\s+/).length < 15) throw new Error("summary is too short");
  return { description, summary };
}

async function draftWithClaude(client, model, entry) {
  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    output_config: { effort: "medium" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userPrompt(entry) }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error(`model declined (${response.stop_details?.category ?? "no category"})`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("model output was cut off at max_tokens");
  }
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  return parseDraft(text);
}

function skeletonDraft(entry) {
  return {
    description: "TODO: first sentence of the summary.",
    summary:
      "TODO: one short paragraph summarizing the developer-facing changes in the release body at " +
      entry.url,
  };
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const { missing } = JSON.parse(fs.readFileSync(findMissing(args), "utf8"));
  fs.mkdirSync(EDITORIAL_DIR, { recursive: true });

  // Newest first, so a capped run covers what readers see at the top of the page.
  const queue = missing
    .filter((entry) => !fs.existsSync(path.join(REPO_ROOT, entry.editorialFile)))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, args.max);

  const needsModel = queue.some((entry) => entry.hasContent) && !args.skeleton;
  let client = null;
  if (needsModel) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(
        "ANTHROPIC_API_KEY is not set and at least one release has content to summarize. " +
          "Set it, or pass --skeleton to write TODO drafts.",
      );
      process.exit(2);
    }
    client = new Anthropic();
  }

  const written = [];
  const skipped = [];
  for (const entry of queue) {
    const target = path.join(REPO_ROOT, entry.editorialFile);
    let draft;
    let how;
    try {
      if (!entry.hasContent) {
        draft = { description: MAINTENANCE_SUMMARY, summary: MAINTENANCE_SUMMARY };
        how = "maintenance";
      } else if (args.skeleton) {
        draft = skeletonDraft(entry);
        how = "skeleton";
      } else {
        draft = await draftWithClaude(client, args.model, entry);
        how = args.model;
        if (draft === null) {
          // The model found no user-facing change behind the body.
          draft = { description: MAINTENANCE_SUMMARY, summary: MAINTENANCE_SUMMARY };
          how = `maintenance, per ${args.model}`;
        }
      }
    } catch (err) {
      const reason =
        err instanceof Anthropic.RateLimitError
          ? "rate limited"
          : err instanceof Anthropic.APIError
            ? `API error ${err.status}: ${err.message}`
            : err.message;
      skipped.push({ entry, reason });
      console.warn(`  ✗ ${entry.product} v${entry.version}: ${reason}`);
      continue;
    }
    fs.writeFileSync(target, renderFile(entry, draft.description, draft.summary));
    written.push({ entry, how });
    console.log(`  ✓ ${entry.editorialFile} (${how})`);
  }

  const noun = written.length === 1 ? "summary" : "summaries";
  console.log(`\nWrote ${written.length} editorial ${noun}.`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length}; they stay uncovered until the next run:`);
    for (const { entry, reason } of skipped) {
      console.log(`  - ${entry.product} v${entry.version}: ${reason}`);
    }
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = ["## Editorial summaries", ""];
    for (const { entry, how } of written) lines.push(`- ${entry.product} v${entry.version} (${how})`);
    if (skipped.length > 0) {
      lines.push("", "Skipped:", "");
      for (const { entry, reason } of skipped) lines.push(`- ${entry.product} v${entry.version}: ${reason}`);
    }
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
}

main().catch((err) => {
  console.error(`generate-editorial-summaries failed: ${err.message}`);
  process.exit(1);
});
