// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0
//
// Builds the map that <ImportContent mode="code"> reads at build time.
//
// Sources resolve in two places:
//   1. This repository, for roots listed in LOCAL_ROOTS (the example projects
//      under examples/).
//   2. The MystenLabs/walrus repository, for roots listed in REMOTE_ROOTS
//      (client configuration under setup/, crate config examples under
//      crates/, and scripts/). Those files are fetched from GitHub at the ref
//      pinned in site/upstream.json, so a build is reproducible and a change in
//      the walrus repository reaches the docs only through a reviewed bump of
//      that file. WALRUS_SOURCE_REPO and WALRUS_SOURCE_REF override the pin.
//
// A source that resolves nowhere fails the build: a silently skipped embed
// renders as a placeholder comment on the published page.

const fs = require("fs");
const path = require("path");

const SITE_ROOT = path.resolve(__dirname, "../.."); // docusaurus site root
const REPO_ROOT = path.resolve(SITE_ROOT, ".."); // repository root is one level up from site
const CONTENT_ROOT = path.resolve(REPO_ROOT, "content"); // content folder
const OUT_FILE = path.join(SITE_ROOT, "src/.generated/ImportContentMap.ts");

const LOCAL_ROOTS = new Set(["examples", "data"]);
const REMOTE_ROOTS = new Set(["setup", "crates", "scripts", "examples"]);

const UPSTREAM = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, "upstream.json"), "utf8"));
const WALRUS_REPO = process.env.WALRUS_SOURCE_REPO || UPSTREAM.walrus.repo;
const WALRUS_REF = process.env.WALRUS_SOURCE_REF || UPSTREAM.walrus.ref;

// --- helpers ---
const readText = (p) => fs.readFileSync(p, "utf8").replace(/\r\n?/g, "\n");

function stripFencedCode(md) {
    // Remove ``` blocks to avoid matching tags shown in code samples.
    // Only match fences that start at the beginning of a line (with optional
    // leading whitespace) to avoid false positives from backticks inside
    // YAML frontmatter strings like `pattern: '```'`.
    return md.replace(/^[ \t]*```[^\n]*\n[\s\S]*?^[ \t]*```/gm, "");
}

// Finds <ImportContent ...> start tags (self-closing or not), attribute order agnostic
const IMPORT_TAG_RE = /<ImportContent\b[^>]*\/?>(?!\s*<\/ImportContent>)/gi;

function* findCodeSources(mdx) {
    const haystack = stripFencedCode(mdx);
    let m;
    while ((m = IMPORT_TAG_RE.exec(haystack))) {
        const tag = m[0];
        if (!/\bmode\s*=\s*["']code["']/i.test(tag)) continue;
        if (/\borg\s*=\s*/i.test(tag)) continue; // tags with an org are fetched client-side
        const srcM = /\bsource\s*=\s*["']([^"']+)["']/i.exec(tag);
        const src = srcM ? srcM[1].trim() : "";
        if (src) yield src;
    }
}

function normalizeRepoRel(src) {
    // strip leading ./ or / for consistency
    return src.replace(/^\/+/, "").replace(/^\.\//, "");
}

// Custom recursive file finder to replace glob
function findFiles(dir, extensions) {
    const files = [];

    function walk(currentPath) {
        try {
            const items = fs.readdirSync(currentPath);
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item).toLowerCase();
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (err) {
            // Skip directories we can't read
        }
    }

    walk(dir);
    return files;
}

async function fetchFromWalrus(rel) {
    const url = `https://raw.githubusercontent.com/${WALRUS_REPO}/${WALRUS_REF}/${rel}`;
    const headers = {};
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
    }
    return (await res.text()).replace(/\r\n?/g, "\n");
}

async function resolveSource(rel) {
    const [root] = rel.split("/");
    if (LOCAL_ROOTS.has(root)) {
        const abs = path.join(REPO_ROOT, rel);
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
            return { text: readText(abs), from: "local" };
        }
    }
    if (REMOTE_ROOTS.has(root)) {
        return { text: await fetchFromWalrus(rel), from: `${WALRUS_REPO}@${WALRUS_REF}` };
    }
    return null;
}

// --- main ---
async function main() {
    const mdxFiles = findFiles(CONTENT_ROOT, [".md", ".mdx"]);
    if (process.env.DEBUG_IMPORT_CONTENT) {
        console.log(`[generate-import-context] Content root:`, CONTENT_ROOT);
        console.log(`[generate-import-context] MDX files found: ${mdxFiles.length}`);
    }
    const wanted = new Map(); // rel -> first mdx file that references it

    for (const mdxPath of mdxFiles) {
        const text = readText(mdxPath);
        for (const raw of findCodeSources(text)) {
            const rel = normalizeRepoRel(raw);
            const [root] = rel.split("/");
            if (!LOCAL_ROOTS.has(root) && !REMOTE_ROOTS.has(root)) {
                throw new Error(
                    `Unsupported ImportContent root "${root}" in ${path.relative(REPO_ROOT, mdxPath)}: ${rel}`,
                );
            }
            if (!wanted.has(rel)) wanted.set(rel, mdxPath);
        }
    }

    const entries = [];
    const failures = [];
    for (const rel of Array.from(wanted.keys()).sort()) {
        try {
            const resolved = await resolveSource(rel);
            if (!resolved) {
                failures.push(`${rel} (referenced from ${path.relative(REPO_ROOT, wanted.get(rel))})`);
                continue;
            }
            if (process.env.DEBUG_IMPORT_CONTENT) {
                console.log(`[generate-import-context] ${rel} <- ${resolved.from}`);
            }
            entries.push(`  ${JSON.stringify(rel)}: ${JSON.stringify(resolved.text)}`);
        } catch (err) {
            failures.push(`${rel}: ${err.message}`);
        }
    }

    if (failures.length > 0) {
        console.error("[generate-import-context] Unresolved ImportContent sources:");
        for (const f of failures) console.error(`  - ${f}`);
        process.exit(1);
    }

    const out = `// AUTO-GENERATED. Do not edit.
// Generated by scripts/generate-import-context.js
export const importContentMap = {
${entries.join(",\n")}
};
`;

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, out, "utf8");
    console.log(`Wrote ${OUT_FILE} with ${entries.length} entries.`);
}

main().catch((err) => {
    console.error(`[generate-import-context] ${err.message}`);
    process.exit(1);
});
