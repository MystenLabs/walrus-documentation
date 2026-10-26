# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

The documentation site for Walrus, Walrus Oyster, and Walrus Memory, published at
https://docs.wal.app. It is a Docusaurus site under `site/` with three content
trees under `content/`: `walrus/` (served under `/docs`), `oyster/` (served under
`/oyster`), `walrus-memory/` (served under `/walrus-memory`), and `blog/`. Product
source code lives in other repositories: `MystenLabs/walrus`, `MystenLabs/oyster`,
and `MystenLabs/MemWal`. Check a page against that source, not against other pages.

## Build and development commands

```bash
cd site
pnpm install   # install dependencies (only needed once)
pnpm build     # production build (checks broken links/anchors)
pnpm start     # local dev server with hot reload
```

The build does not call the GitHub API. Content from other repositories is
tracked here and refreshed only by the `Update upstream content` workflow (or
`pnpm gen:upstream`, which needs `GITHUB_TOKEN`), which opens a pull request:
`site/src/data/skills.json`, `content/walrus/release-notes/*.mdx`,
`site/src/data/changelog.json`, and the walrus ref in `site/upstream.json` that
embedded source files are fetched from. Do not edit those generated files by
hand, and do not bump the pin outside a pull request. Everything under
`site/src/.generated/` is build output.

Release summaries in `editorial/` are drafted in batches by the `Editorial summaries`
workflow and reviewed in its pull request; edit them there or by hand, in the
house format the existing files use.

The sidebars for Oyster and Walrus Memory are
tracked files; regenerate them with `pnpm gen:oyster-sidebar` and
`pnpm gen:memory-sidebar` after adding pages.

The sidebars for Oyster and Walrus Memory are tracked files; regenerate them
with `pnpm gen:oyster-sidebar` and `pnpm gen:memory-sidebar` after adding pages.

## Style

All documentation must follow the [Sui Documentation Style Guide](https://docs.sui.io/style-guide).
The most important rules are:

- **Language:** US English, second person ("you"), present tense, active voice.
- **Page titles:** Title case. **Headings:** Sentence case.
- **Latin abbreviations:** Do not use `e.g.`, `i.e.`, or `etc.` — write "for example", "that is",
  or rephrase.
- **Word choices:** Use "might" (not "may"), "through" (not "via"), "because" (not causal "since").
- **Punctuation:** Oxford commas are mandatory. No exclamation marks.
- **Sentence starters:** Do not begin sentences with "Note" or "Please note".
- **Admonitions:** Use `:::info`, `:::tip`, `:::warning` (Docusaurus syntax). Content must be
  complete sentences.
- **Code blocks:** Use triple backticks with a language identifier. Introduce with descriptive text.
  Align inline comments within code blocks.
- **Links:** Use relative paths for internal links (for example, `/docs/operator-guide/storage-node`).
- **Tabs:** Use `<Tabs>` and `<TabItem>` (globally available, no import needed) for
  Testnet/Mainnet differences or prerequisites checklists. Wrap in
  `<div className="outlined-tabs">` for the outlined style.

## Commit messages

[Conventional commits](https://www.conventionalcommits.org/): `docs:`, `fix:`, `build:`, `chore:`, `ci:`.
