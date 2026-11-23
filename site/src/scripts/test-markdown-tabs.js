const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function exportMarkdown(context, source) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'walrus-markdown-tabs-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const site = path.join(root, 'site');
  const scripts = path.join(site, 'src/scripts');
  const input = path.join(site, '.markdown/with-imports');
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(input, { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, 'copy-markdown-files.js'),
    path.join(scripts, 'copy-markdown-files.js'),
  );
  fs.symlinkSync(path.resolve(__dirname, '../../node_modules'), path.join(site, 'node_modules'));
  fs.writeFileSync(path.join(input, 'page.mdx'), source);
  execFileSync(process.execPath, [path.join(scripts, 'copy-markdown-files.js')]);
  const markdown = fs.readFileSync(path.join(site, 'static/markdown/page.md'), 'utf8');
  assert.equal(fs.readFileSync(path.join(site, 'static/docs/page.md'), 'utf8'), markdown);
  return markdown;
}

test('exports every quickstart tab and preserves its code blocks', context => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../../../content/walrus/blob-operations-quickstart.mdx'),
    'utf8',
  );
  const markdown = exportMarkdown(context, source);
  for (const label of ['CLI', 'HTTP API', 'Python']) {
    assert.equal(markdown.split(`**${label}**`).length - 1, 3);
  }
  for (const block of source.match(/```[\s\S]*?```/g)) {
    assert.ok(markdown.includes(block.replace(/\n{3,}/g, '\n\n')),
      `Missing code block: ${block.slice(0, 100)}`);
  }
  assert.doesNotMatch(markdown, /<\/?Tab(?:s|Item)\b/);
});

test('preserves nested tabs, single-quoted labels, and value-only tabs', context => {
  const markdown = exportMarkdown(context, `
<Tabs groupId="network">
<TabItem value="mainnet" label='Mainnet'>
Outer instructions.
<Tabs>
<TabItem value='cli'>Nested CLI instructions.</TabItem>
<TabItem label="HTTP API" value="http">Nested HTTP instructions.</TabItem>
</Tabs>
</TabItem>
<TabItem value="testnet" label="Testnet">Testnet instructions.</TabItem>
</Tabs>
`);
  for (const text of ['**Mainnet**', '**cli**', '**HTTP API**', '**Testnet**',
    'Outer instructions.', 'Nested CLI instructions.', 'Nested HTTP instructions.',
    'Testnet instructions.']) {
    assert.ok(markdown.includes(text), `Missing ${text}`);
  }
  assert.doesNotMatch(markdown, /<\/?Tab(?:s|Item)\b/);
});

test('leaves tab markup inside code examples unchanged', context => {
  const source = '```jsx\n<Tabs><TabItem label="Example">Code</TabItem></Tabs>\n```\n\n`<TabItem value="inline">`';
  assert.equal(exportMarkdown(context, source).trim(), source);
});
