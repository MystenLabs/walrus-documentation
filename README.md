# Walrus Documentation

Developer documentation for Walrus, Walrus Oyster, and Walrus Memory, built with
[Docusaurus](https://docusaurus.io/) and published at [docs.wal.app](https://docs.wal.app/).

This repository holds every page the site serves. The Oyster and Walrus Memory
docs used to be fetched from their product repositories at build time; they now
live here under `oyster-content/` and `walrus-memory-content/`, and a change to
them is a pull request here.

## Quick start

```bash
cd site
pnpm install   # install dependencies (first time only)
pnpm start     # local dev server with hot reload
```

To run a production build (checks broken links and anchors):

```bash
pnpm build
pnpm serve     # preview the production build locally
```

Requires Node.js 18+ and pnpm. The build has no GitHub API dependency: the
only network access is fetching a few embedded source files from the
`MystenLabs/walrus` repository at the ref pinned in `site/upstream.json`.

## Directory structure

```text
.
├── blog/                  # Blog posts (MDX)
├── content/               # Walrus documentation pages (MDX), served under /docs
│   ├── getting-started/   # Onboarding and quickstart guides
│   ├── system-overview/   # Architecture and design
│   ├── walrus-client/     # CLI and client usage
│   ├── typescript-sdk/    # TypeScript SDK reference
│   ├── http-api/          # HTTP API reference
│   ├── operator-guide/    # Storage node operator docs
│   ├── sites/             # Walrus Sites documentation
│   ├── examples/          # Example code and tutorials
│   ├── snippets/          # Reusable MDX snippets
│   └── ...
├── oyster-content/        # Walrus Oyster docs, served under /oyster
├── walrus-memory-content/ # Walrus Memory docs, served under /walrus-memory
├── data/                  # YAML data files (portals list, etc.)
├── editorial/             # Release notes source files
├── examples/              # Standalone example projects (Move, JS, Python, shell)
├── fundamentals/          # Supplementary architecture content
├── scripts/cache-inference/ # Weekly aggregator cache measurement (operators.json)
└── site/                  # Docusaurus project root
    ├── docusaurus.config.js
    ├── sidebars.js                # Walrus sidebar
    ├── sidebarsOyster.js          # Oyster sidebar (regenerate with pnpm gen:oyster-sidebar)
    ├── sidebarsWalrusMemory.js    # Walrus Memory sidebar (regenerate with pnpm gen:memory-sidebar)
    ├── vercel.json                # Redirects and rewrites
    ├── src/
    │   ├── components/    # Site-specific React components
    │   ├── pages/         # Standalone pages
    │   ├── plugins/       # Docusaurus plugins
    │   ├── scripts/       # Build-time generation scripts
    │   ├── shared/        # Shared Docusaurus components (git subtree)
    │   └── theme/         # Theme overrides (swizzled components)
    └── static/            # Static assets (images, fonts, etc.)
```

## Writing documentation

### Style guide

All documentation must follow the
[Sui Documentation Style Guide](https://docs.sui.io/style-guide). Key rules:

- **Language:** US English, second person ("you"), present tense, active voice.
- **Page titles:** Title case. **Headings:** Sentence case.
- **Latin abbreviations:** Do not use `e.g.`, `i.e.`, or `etc.` Write "for example", "that is", or rephrase.
- **Word choices:** Use "might" (not "may"), "through" (not "via"), "because" (not causal "since").
- **Punctuation:** Oxford commas are mandatory. No exclamation marks.
- **Admonitions:** Use `:::info`, `:::tip`, `:::warning` (Docusaurus syntax).
- **Code blocks:** Use triple backticks with a language identifier.
- **Links:** Use relative paths for internal links.

### Tabs

Use `<Tabs>` and `<TabItem>` for Testnet/Mainnet differences or prerequisite
checklists. Wrap in `<div className="outlined-tabs">` for outlined styling.
These components are globally available and do not need to be imported.

### Snippets

Reusable content fragments live in `content/snippets/`. Import them into pages with the
`import` statement for MDX.

### Embedding source files

`<ImportContent source="..." mode="code" />` embeds a file at build time.
Sources under `examples/` resolve from this repository. Sources under
`setup/`, `crates/`, and `scripts/` are fetched from
[`MystenLabs/walrus`](https://github.com/MystenLabs/walrus) at the ref pinned in
`site/upstream.json`, so the docs show the canonical copy of client
configuration and crate config examples and a build is reproducible. The
`Update upstream content` workflow bumps the pin to the latest Mainnet release
through a pull request. `WALRUS_SOURCE_REF` overrides it locally. A source that
resolves nowhere fails the build.

## Release notes editorial summaries

Each release of Walrus, Walrus Memory, and Walrus Sites gets an editorial summary in
`editorial/`, which the release notes pages render. The `Editorial summaries` workflow runs
on the 1st and 15th, drafts a summary for every release that has none (from the GitHub
release body, with Claude), regenerates the release notes pages, and opens one pull request
with the batch. Review the summaries there as you would any docs page. `pnpm gen:editorial`
in `site/` does the same locally; it needs `GITHUB_TOKEN` and `ANTHROPIC_API_KEY`.

## Build pipeline

The full build runs these steps in sequence:

1. **`prestart` / `prebuild`** — Resolves embedded source files and copies YAML
   files.
1. **`build:prep`** — Inlines imports, copies markdown files, and generates `llms.txt` /
   `llms-full.txt` for each doc set.
1. **`docusaurus build`** — Compiles the Docusaurus site.

## Content from other repositories

Everything the site shows from other repositories is tracked in this one and
changes only through a pull request, so a push elsewhere can neither break a
build nor publish unreviewed pages:

- The Oyster and Walrus Memory docs are source here, under `oyster-content/`
  and `walrus-memory-content/`.
- `site/src/data/skills.json` (from
  [`MystenLabs/walrus-skills`](https://github.com/MystenLabs/walrus-skills)),
  the release notes pages and `site/src/data/changelog.json` (from GitHub
  releases), and the `MystenLabs/walrus` ref in `site/upstream.json` are refreshed by the
  `Update upstream content` workflow, which runs daily and opens a pull request
  when anything changed. Run `pnpm gen:upstream` in `site/` to refresh them by
  hand; it needs `GITHUB_TOKEN`.

## Redirects and custom headers

Redirects and rewrites are configured in `site/vercel.json`. Do not use
client-side JavaScript redirects.

## Shared components

This project uses shared TSX/JSX components from
[ML-Shared-Docusaurus](https://github.com/MystenLabs/ML-Shared-Docusaurus),
pulled in as a git subtree at `site/src/shared/`. These components are also
used by the Sui, SuiNS, and Seal documentation sites.

To update shared components:

```bash
git subtree pull --prefix=site/src/shared https://github.com/MystenLabs/ML-Shared-Docusaurus.git master --squash
```

## Deployment

Vercel deploys production from `main` and a preview for every pull request
through its Git integration. The `Build docs` workflow runs the same build in
CI so a broken link fails the pull request before it merges.
