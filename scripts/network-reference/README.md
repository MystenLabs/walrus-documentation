# Network reference generator

`generate_network_reference.py` regenerates the volatile blocks of
`content/network-reference.mdx` from three inputs that live in `MystenLabs/walrus`:

- `setup/client_config.yaml` (object IDs, RPC URLs, shard counts, max epochs ahead)
- `mainnet-contracts/<pkg>/Published.toml` (Mainnet package IDs)
- `scripts/network_reference_data.yaml` (curated values with no other canonical source)

It moved here from the walrus repository unchanged when the docs did, so it still expects
those inputs relative to a walrus checkout. Until it is taught to fetch them from
`MystenLabs/walrus` at the ref pinned in `site/upstream.json`, run it from a walrus checkout
with `PAGE_PATH` pointed at this repository's page, or regenerate the page by hand. The
drift check that ran in walrus CI (`--check`) is not wired up here yet.
