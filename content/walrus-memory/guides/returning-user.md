---
title: Sign in as a Returning User
description: What to expect when you return to Walrus Memory on a new device or as an existing Walrus user, covering first-sign-in memory discovery, the re-upload expectation, and what your wallet reveals onchain.
keywords: [returning user, existing user, sign in, recovery, delegate key, restore, migration, re-upload, wallet visibility, privacy, Walrus Memory, Walrus]
---

Your memories live on Walrus and your account lives on Sui, so they persist no matter which device you sign in from. Only the delegate key your browser used last time stays behind. On a new device, expect to recover access, re-upload rather than import existing Walrus data, and see what your account reveals onchain.

:::info
**Post-GA:** Walrus Memory ships the full returning-user onboarding experience after GA. The delegate-key recovery flow below works today and matches the current dashboard behavior. The wider existing-user experience, including console visibility for existing Walrus assets, is on the near-term product roadmap.
:::

## Is your account tied to one device?

Walrus Memory stores your memories as encrypted blobs on Walrus and records your account and its permissions on Sui. Neither depends on your browser. When you connect the same wallet again, whether a week later or on a different machine, the same account and the same memories are still yours.

The one thing that stays local is the delegate key. A delegate key is a keypair your account authorizes to read and write memory on your behalf. The dashboard keeps it in the browser you created it in, so a new browser starts without it. Expect this; recovering takes a single step.

## How to sign in on a new device

When you connect your wallet on a device where you have not yet created a delegate key, the dashboard checks Sui for your account and shows you one of two states.

### Step 1: The dashboard finds your existing account

If your wallet already owns a Walrus Memory account, the dashboard tells you the account is active but this browser does not hold a delegate key. Your memories are safe. You just need a key on this device to reach them.

### Step 2: Create a new delegate key

Create a new delegate key from the dashboard. It generates a fresh keypair and registers it to your existing account onchain, so the new key joins the account rather than replacing it. Save the private key somewhere secure, because the dashboard shows it only once.

### Step 3: Reach your existing memories

Because your account's owner and delegates enforce access control onchain, the account decrypts its memories with any delegate key it registers. The new key you just created reads the memories you wrote with the old one. You do not need to recover the old key.

:::note
Losing a delegate key does not lose your memories. The key is a credential for reaching your account, not the account itself. Create a new one and your memories are still there. If someone else might now hold a key you lost, remove that key from your account on the dashboard so it can no longer act on your behalf.
:::

### Do you need to restore your memories?

The search index lives in the relayer's database, not your browser, scoped to your account and namespace. Once you have a delegate key on the new device, recall reaches your existing memories straight away, with nothing to rebuild.

You only run restore when the relayer's index lacks rows, for example after a database loss or reset, or when you point a fresh self-hosted relayer at your account. Restore rediscovers the blobs your account owns in a namespace and re-indexes any the relayer does not already have:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/guides/returning-user.md" target="_blank" className="code-source-link">Source: guides/returning-user.md</a>

```ts
const result = await memwal.restore("personal");
console.log(`restored=${result.restored} skipped=${result.skipped} total=${result.total}`);
```

Restore inspects your onchain blobs newest-first, up to `limit` (default 10), so `total` is the number of blobs it inspected in that call, not a full count of your namespace. Restore has no pagination cursor, so repeating a call at the same limit re-inspects the same newest blobs and returns nothing new. To rebuild a large namespace, set `limit` high enough to cover every blob in the namespace in a single call: because restore has no cursor, rerunning it only re-inspects the same newest blobs, and a `restored` count that stops increasing is not proof that every blob has been covered. For how restore works, see [How Storage Works](/walrus-memory/fundamentals/architecture/how-storage-works).

## Does Walrus Memory migrate existing Walrus data?

If you already store files on Walrus directly, expect a clear boundary: Walrus Memory does not import those blobs as memories. There is no migration step, by design. The console does not yet show existing Walrus assets either; surfacing them there is on the near-term product roadmap.

A memory is not just a blob. When Walrus Memory stores a memory, it encrypts the content with Seal so that only your account's owner and delegates can decrypt it, attaches namespace metadata, and generates a vector embedding so recall can match the memory by meaning. An arbitrary blob you uploaded to Walrus through another tool has none of that structure, so Walrus Memory cannot treat it as a memory or return it from recall.

To bring existing content into Walrus Memory, write it through the SDK, which produces a proper memory:

<a href="https://github.com/MystenLabs/MemWal/blob/dev/docs/guides/returning-user.md" target="_blank" className="code-source-link">Source: guides/returning-user.md</a>

```ts
await memwal.rememberAndWait("Content you want to carry into Walrus Memory.");
```

:::note
Re-uploading is not a loss of ownership. You still own the original Walrus blobs, and re-uploading through the SDK creates a new, encrypted, searchable memory that you also own. Your data stays yours throughout.
:::

This boundary runs the other way too. Deleting a memory in Walrus Memory does not touch any separate Walrus blob you uploaded elsewhere, because they are different objects with different owners and lifecycles.

## What does your wallet reveal onchain?

Walrus Memory keeps your content private but your ownership public. Know which is which before you rely on it.

- **Walrus Memory keeps your content private.** It Seal-encrypts every memory before the memory reaches Walrus, and only your account's owner and delegates can decrypt it. No one else reads your memories, including the relayer operator when you use client-managed encryption.
- **Anyone can see your ownership.** Sui shows the `Blob` objects your wallet owns, along with metadata such as blob IDs, sizes, expiry epochs, and the namespace label. Anyone inspecting the chain can see that your address owns blobs and how many, even though they cannot read the contents.
- **Anyone can read namespace labels.** A namespace is an organizing label that Walrus Memory stores as metadata, not a private field. Avoid putting sensitive information in a namespace name.

:::warning
Treat namespace names and the fact that your wallet owns memory as public. Keep anything sensitive inside the memory content, which Walrus Memory encrypts, and never in a namespace label or other metadata, which it does not.
:::

For the full ownership and access model, see [Ownership and Delegates](/walrus-memory/fundamentals/concepts/ownership-and-access).

## Remove a lost delegate key

To revoke a key you lost, open [memory.walrus.xyz](https://memory.walrus.xyz), find the delegate that matches the key's address in the **Delegate keys** panel, and remove it. Until you remove it, that delegate keeps its onchain authorization on your account. Only the account owner can add or remove delegate keys, so connect the owner wallet.

Removing a delegate rotates the account's encryption identity for future writes. It does not take back plaintext the delegate already read, or decryption keys it already obtained. Logging out of a client, such as with `memwal_logout`, only deletes local credentials and does not revoke the onchain delegate.
