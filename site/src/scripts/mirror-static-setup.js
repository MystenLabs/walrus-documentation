// Copyright (c) Walrus Foundation
// SPDX-License-Identifier: Apache-2.0
//
// Mirrors the client setup files that docs.wal.app serves for download under
// /setup/ (for example, the `curl https://docs.wal.app/setup/client_config.yaml`
// command on the Walrus CLI page) into site/static/setup/.
//
// The files come from the MystenLabs/walrus repository at the ref pinned in
// site/upstream.json, the same ref that <ImportContent> embeds are fetched
// from, so the downloadable file and the embedded copy on the page always
// match. The mirrored files are tracked in git and refreshed by the
// `Update upstream content` workflow (`pnpm gen:upstream`); the build itself
// does not run this script. WALRUS_SOURCE_REPO and WALRUS_SOURCE_REF override
// the pin.

const fs = require("fs");
const path = require("path");

const SITE_ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(SITE_ROOT, "static", "setup");

const UPSTREAM = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, "upstream.json"), "utf8"));
const WALRUS_REPO = process.env.WALRUS_SOURCE_REPO || UPSTREAM.walrus.repo;
const WALRUS_REF = process.env.WALRUS_SOURCE_REF || UPSTREAM.walrus.ref;

// Published name under /setup/ -> path in the walrus repository.
const MIRROR = {
    "client_config.yaml": "setup/client_config.yaml",
    "client_config_mainnet.yaml": "setup/client_config_mainnet.yaml",
    "client_config_testnet.yaml": "setup/client_config_testnet.yaml",
    "client_config_example.yaml": "crates/walrus-sdk/client_config_example.yaml",
    "walrus_upload_relay_config_example.yaml": "crates/walrus-upload-relay/walrus_upload_relay_config_example.yaml",
    "walrus-install.sh": "setup/walrus-install.sh",
};

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

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const failures = [];
    let written = 0;
    for (const [name, rel] of Object.entries(MIRROR)) {
        try {
            const text = await fetchFromWalrus(rel);
            const target = path.join(OUT_DIR, name);
            // Replace a symlink or stale file outright so the mirror is a plain file.
            fs.rmSync(target, { force: true });
            fs.writeFileSync(target, text, "utf8");
            written += 1;
        } catch (err) {
            failures.push(`${name} <- ${rel}: ${err.message}`);
        }
    }
    if (failures.length > 0) {
        console.error("[mirror-static-setup] Files that could not be mirrored:");
        for (const f of failures) console.error(`  - ${f}`);
        process.exit(1);
    }
    console.log(`Wrote ${written} file(s) to ${OUT_DIR} from ${WALRUS_REPO}@${WALRUS_REF}.`);
}

main().catch((err) => {
    console.error(`[mirror-static-setup] ${err.message}`);
    process.exit(1);
});
