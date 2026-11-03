// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0

// Edge Middleware: server-side AI agent tracking via Plausible.
// Fires a Plausible event when an AI coding agent is detected,
// capturing visits that never execute client-side JavaScript.
// It also writes each agent request to the Vercel runtime log (see below).

// --- Agent traffic log -------------------------------------------------------
// Each request from an AI agent writes one `agent-hit {...}` line to the Vercel
// runtime log. The docs data dashboard collects those lines every few hours
// (Vercel keeps runtime logs for about a day) and charts them. This block is
// shared word for word by the Sui and Walrus docs middleware.

// First match wins, so the specific agents come before the catch-alls.
// purpose: "user" fetches a page because a person asked an assistant something;
// "coding" is a coding tool; "search" builds an AI search index; "training"
// collects training data.
export const AGENTS = [
  { name: 'Claude Code', purpose: 'coding', pattern: /claude[-_]?code/i },
  { name: 'Cursor', purpose: 'coding', pattern: /\bcursor\b/i },
  { name: 'GitHub Copilot', purpose: 'coding', pattern: /copilot/i },
  { name: 'Windsurf', purpose: 'coding', pattern: /windsurf|codeium/i },
  { name: 'Codex', purpose: 'coding', pattern: /\bcodex\b/i },
  { name: 'Cline', purpose: 'coding', pattern: /\bcline\b/i },
  { name: 'Tabnine', purpose: 'coding', pattern: /tabnine/i },
  { name: 'Sourcegraph Cody', purpose: 'coding', pattern: /sourcegraph|\bcody\b/i },
  { name: 'ChatGPT-User', purpose: 'user', pattern: /ChatGPT-User/i },
  { name: 'Claude-User', purpose: 'user', pattern: /Claude-User/i },
  { name: 'Perplexity-User', purpose: 'user', pattern: /Perplexity-User/i },
  { name: 'MistralAI-User', purpose: 'user', pattern: /MistralAI-User/i },
  { name: 'DuckAssistBot', purpose: 'user', pattern: /DuckAssistBot/i },
  { name: 'Meta-ExternalFetcher', purpose: 'user', pattern: /meta-externalfetcher/i },
  { name: 'Google-CloudVertexBot', purpose: 'user', pattern: /Google-CloudVertexBot/i },
  { name: 'OAI-SearchBot', purpose: 'search', pattern: /OAI-SearchBot/i },
  { name: 'Claude-SearchBot', purpose: 'search', pattern: /Claude-SearchBot/i },
  { name: 'PerplexityBot', purpose: 'search', pattern: /PerplexityBot/i },
  { name: 'GPTBot', purpose: 'training', pattern: /GPTBot/i },
  { name: 'ClaudeBot', purpose: 'training', pattern: /ClaudeBot|anthropic-ai/i },
  { name: 'Meta-ExternalAgent', purpose: 'training', pattern: /meta-externalagent/i },
  { name: 'CCBot', purpose: 'training', pattern: /CCBot/ },
  { name: 'Bytespider', purpose: 'training', pattern: /Bytespider/i },
  { name: 'Amazonbot', purpose: 'training', pattern: /Amazonbot/i },
  { name: 'Applebot', purpose: 'search', pattern: /Applebot/i },
  { name: 'cohere-ai', purpose: 'training', pattern: /cohere/i },
  { name: 'AI2Bot', purpose: 'training', pattern: /AI2Bot/i },
  { name: 'Other Anthropic', purpose: 'other', pattern: /anthropic/i },
  { name: 'Other OpenAI', purpose: 'other', pattern: /openai|chatgpt/i },
  { name: 'Other Perplexity', purpose: 'other', pattern: /perplexity/i },
];

/** The agent behind a request, or null for a browser or an unknown client. */
export function classifyAgent(userAgent, accept) {
  const ua = userAgent || '';
  for (const a of AGENTS) {
    if (a.pattern.test(ua)) return { agent: a.name, purpose: a.purpose };
  }
  // Clients that ask for markdown are agents even when their user agent is a
  // plain HTTP library.
  if ((accept || '').includes('text/markdown')) return { agent: 'Other markdown client', purpose: 'coding' };
  return null;
}

/** What kind of file a path is, or null for an asset that isn't worth counting. */
export function pathFormat(path) {
  if (/\/llms(-full)?\.txt$/.test(path)) return 'llms';
  if (/\/(robots\.txt|sitemap[^/]*\.xml)$/.test(path)) return 'meta';
  if (path.endsWith('.md') || path.startsWith('/markdown/')) return 'md';
  if (path.startsWith('/assets/') || /\.[a-z0-9]{1,5}$/i.test(path)) return null;
  return 'html';
}

// The markdown rewrite fetches its file through the middleware again; this
// header marks that request so it isn't counted twice.
export const SUBREQUEST_HEADER = 'x-agent-subrequest';

export function logAgentHit(request, hit, format) {
  if (!hit || !format || request.headers.get(SUBREQUEST_HEADER)) return;
  const path = new URL(request.url).pathname;
  console.log(`agent-hit ${JSON.stringify({ agent: hit.agent, purpose: hit.purpose, format, path: path.slice(0, 300) })}`);
}
// -----------------------------------------------------------------------------

const AI_AGENT_PATTERN =
  /claude[-_]?code|anthropic|cursor|copilot|chatgpt|openai|gptbot|perplexity|cohere|codeium|windsurf|tabnine|sourcegraph|cody/i;

function detectServerVisitorType(request) {
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  if (AI_AGENT_PATTERN.test(ua)) return 'agent';
  if (accept.includes('text/markdown')) return 'agent';
  return null;
}

function trackPlausibleEvent(request, visitorType) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

  fetch('https://plausible.io/api/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ua,
      'X-Forwarded-For': ip,
    },
    body: JSON.stringify({
      name: 'pageview',
      domain: 'docs.wal.app',
      url: url.toString(),
      referrer: request.headers.get('referer') || '',
      props: { visitor_type: visitorType },
    }),
  }).catch(() => {});
}

export const config = {
  matcher: [
    '/((?!_next|api|static|img|fonts|favicon).*)',
  ],
};

export default async function middleware(request) {
  const visitorType = detectServerVisitorType(request);
  if (visitorType === 'agent') {
    trackPlausibleEvent(request, visitorType);
  }
  const path = new URL(request.url).pathname;
  logAgentHit(request, classifyAgent(request.headers.get('user-agent'), request.headers.get('accept')), pathFormat(path));
  return;
}
