// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0

// Tests the agent traffic log in middleware.js: which requests write an
// `agent-hit` line, and what the line says.
//   node --test src/scripts/test-agent-traffic.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import middleware, { classifyAgent, pathFormat } from '../../middleware.js';

const UA = {
  claudebot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  chatgptUser: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  oaiSearch: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
  gptbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
  browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
};

test('classifyAgent names the agent and its purpose', () => {
  assert.deepEqual(classifyAgent(UA.claudebot), { agent: 'ClaudeBot', purpose: 'training' });
  assert.deepEqual(classifyAgent(UA.chatgptUser), { agent: 'ChatGPT-User', purpose: 'user' });
  assert.deepEqual(classifyAgent(UA.oaiSearch), { agent: 'OAI-SearchBot', purpose: 'search' });
  assert.deepEqual(classifyAgent('Claude-User (claude-code/2.1.0)'), { agent: 'Claude Code', purpose: 'coding' });
  assert.deepEqual(classifyAgent('axios/1.7.2', 'text/markdown, */*'), { agent: 'Other markdown client', purpose: 'coding' });
  assert.equal(classifyAgent(UA.browser, 'text/html'), null);
  assert.equal(classifyAgent('', ''), null);
});

test('pathFormat sorts pages from the files agents fetch, and skips assets', () => {
  assert.equal(pathFormat('/guides/developer'), 'html');
  assert.equal(pathFormat('/guides/developer.md'), 'md');
  assert.equal(pathFormat('/markdown/guides/developer.md'), 'md');
  assert.equal(pathFormat('/llms.txt'), 'llms');
  assert.equal(pathFormat('/llms-full.txt'), 'llms');
  assert.equal(pathFormat('/robots.txt'), 'meta');
  assert.equal(pathFormat('/sitemap.xml'), 'meta');
  assert.equal(pathFormat('/assets/js/main.123.js'), null);
  assert.equal(pathFormat('/img/logo.svg'), null);
});

/** Runs the middleware with console.log and fetch captured. */
async function run(url, headers, fetchImpl = async () => new Response('', { status: 404 })) {
  const logs = [];
  const fetches = [];
  const origLog = console.log;
  const origFetch = globalThis.fetch;
  console.log = (line) => logs.push(line);
  globalThis.fetch = async (u, opts) => { fetches.push({ url: String(u), opts }); return fetchImpl(u, opts); };
  try {
    const res = await middleware(new Request(url, { headers }));
    return { res, hits: logs.filter((l) => l.startsWith('agent-hit ')).map((l) => JSON.parse(l.slice(10))), fetches };
  } finally {
    console.log = origLog;
    globalThis.fetch = origFetch;
  }
}

test('a crawler fetching a page logs one html hit', async () => {
  const { hits } = await run('https://docs.wal.app/guides/developer', { 'user-agent': UA.gptbot });
  assert.deepEqual(hits, [{ agent: 'GPTBot', purpose: 'training', format: 'html', path: '/guides/developer' }]);
});

test('a browser logs nothing and sends no Plausible event', async () => {
  const { hits, fetches } = await run('https://docs.wal.app/guides/developer', { 'user-agent': UA.browser, accept: 'text/html' });
  assert.equal(hits.length, 0);
  assert.equal(fetches.length, 0);
});

test('llms.txt is counted', async () => {
  const { hits, fetches } = await run('https://docs.wal.app/llms.txt', { 'user-agent': UA.claudebot });
  assert.deepEqual(hits.map((h) => h.format), ['llms']);
});

test('a .md file request logs one md hit', async () => {
  const { hits } = await run('https://docs.wal.app/docs/usage/started.md', { 'user-agent': UA.chatgptUser });
  assert.deepEqual(hits, [{ agent: 'ChatGPT-User', purpose: 'user', format: 'md', path: '/docs/usage/started.md' }]);
});
