// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0

/**
 * Reduces a Walrus Console GitHub release body to what docs.wal.app publishes.
 *
 * MystenLabs/console is an internal repository, so its release bodies are
 * written for the team: they name access-control fixes, logging, rate limits,
 * env keys, and migrations, and link pull requests that 404 for the public.
 * This module keeps only the `### Features` and `### Fixes` sections, drops
 * internal tooling items, and replaces every security-related item with one
 * generic line, without links.
 *
 * The security filter matches keywords, so it errs toward dropping an item.
 * Review the rendered page in the update pull request before it merges.
 *
 * Used by generate-release-notes.js and check-editorial-coverage.js.
 */

const PUBLIC_SECTIONS = new Set(["features", "fixes"]);

const SECURITY_LINE = "Security strengthening";

// Anything that touches access control, secrets, hardening, abuse limits, or
// data handling. Collapsed into SECURITY_LINE, never published as written.
const SECURITY_PATTERNS = [
  /secur/i,
  /\bcsp\b/i,
  /content[- ]security/i,
  /script-src|connect-src|unsafe-inline/i,
  /\bheaders?\b/i,
  /authori[sz]/i,
  /authenticat/i,
  /\bcredential/i,
  /permission/i,
  /\bvouch/i,
  /\bredact/i,
  /\bmask/i,
  /\bscrub/i,
  /\bpii\b/i,
  /secret|_KEYS?\b|api[_ ]?key/i,
  /rate[- ]limit|circuit breaker|\bcap\b|probation|abuse/i,
  /\bsignup\b|sign-up/i,
  /\baad\b|decrypt|encrypt/i,
  /\bseal\b/i,
  /\bsign(ed|s)? on-chain|\bsign on-chain/i,
  /pagination cursor|\bcursors\b/i,
  /\bmalformed\b|\bbounded\b|reject/i,
  /x-request-id/i,
  /\bsession\b/i,
  /\bposture\b/i,
  /\bzklogin\b/i,
  /\bvulnerab|\bexploit|\bcve-/i,
];

// Team tooling with nothing for a Console user. Dropped silently.
const INTERNAL_PATTERNS = [
  /statsig/i,
  /sentry/i,
  /google tag manager|\bgtm\b/i,
  /\bpino\b|\blogs?\b|\blogging\b/i,
  /\bcounters?\b|\bmetrics?\b|\balerts?\b|\bpaging\b/i,
  /runbook/i,
  /\bworker\b/i,
  /\bpostgres\b|\bmigration/i,
  /\benv\b|env keys|NEXT_PUBLIC_/i,
  /@noble|shadcn|bullmq|\bnode \d/i,
  /\bbehind [A-Z_]{4,}\b/,
  /changesets?|\bci\b|workflow/i,
];

function isSecurity(text) {
  return SECURITY_PATTERNS.some((re) => re.test(text));
}

function isInternal(text) {
  return INTERNAL_PATTERNS.some((re) => re.test(text));
}

// Strips the trailing PR reference and any inline links, keeping link text.
function cleanItem(text) {
  return text
    .replace(/\s*\((?:\[#\d+\]\([^)]*\)(?:,\s*)?)+[^)]*\)\s*$/, "")
    .replace(/\s*\(#\d+\)\s*$/, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\*\*([^*]+)\*\*:\s*/, "$1: ")
    .trim();
}

/**
 * Returns the public changes in a Console release body, in order, as plain
 * strings. Security items become one SECURITY_LINE at the end.
 */
function extractConsoleChanges(body) {
  if (!body) return [];
  const changes = [];
  let hasSecurity = false;
  let section = null;

  for (const line of body.replace(/\r\n?/g, "\n").split("\n")) {
    const trimmed = line.trim();
    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      section = heading[1].trim().toLowerCase();
      continue;
    }
    if (!PUBLIC_SECTIONS.has(section)) continue;

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (!bullet) continue;

    const text = cleanItem(bullet[1]);
    if (!text) continue;
    if (isSecurity(bullet[1])) {
      hasSecurity = true;
      continue;
    }
    if (isInternal(bullet[1])) continue;
    changes.push(text);
  }

  if (hasSecurity) changes.push(SECURITY_LINE);
  return changes;
}

/**
 * The filtered body as Markdown, for the editorial summary drafter: the model
 * only ever sees what the page is allowed to publish.
 */
function publicConsoleBody(body) {
  const changes = extractConsoleChanges(body);
  if (changes.length === 0) return "";
  return "### Changes\n\n" + changes.map((c) => `- ${c}`).join("\n");
}

// Only final releases: v0.2.0-beta.8 would otherwise collide with v0.2.0.
function parseConsoleTag(tag) {
  const match = tag.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
  };
}

module.exports = {
  SECURITY_LINE,
  extractConsoleChanges,
  publicConsoleBody,
  parseConsoleTag,
};
