# Publishing

The extension is published in two places: the **Visual Studio Marketplace** (what VS Code searches) and **Open VSX** (used by VSCodium, Cursor, Windsurf, Gitpod and others). Both take the same `.vsix`.

## Before the first release

1. **Pick a licence** and add a `LICENSE` file. Replace `"license": "UNLICENSED"` in `package.json` with its SPDX id (for example `MIT` or `Apache-2.0`). Consider whether the exercises in `languages/` should have the same licence as the code.
2. **Check the publisher id.** `package.json` has `"publisher": "meddlin"`. It must match the publisher you create below. Also remove `"private": true`.
3. Check the repository URL, README and CHANGELOG.

## Visual Studio Marketplace

1. Sign in at <https://marketplace.visualstudio.com/manage> with a Microsoft account and **create a publisher** (its ID is the `publisher` field).
2. In Azure DevOps (<https://dev.azure.com>) create a **Personal Access Token**: organisation *All accessible organizations*, scope *Marketplace → Manage*. Copy it.
3. Log in and publish:

```bash
npx vsce login <publisher-id>      # paste the token
npm run package                    # builds and creates learning-dojo-<version>.vsix
npx vsce publish                   # or: npx vsce publish patch | minor | major
```

Open the `.vsix` contents first with `npx vsce ls` to confirm only `dist/`, `languages/`, `media/`, the README, the CHANGELOG and the licence are inside.

## Open VSX

1. Sign in at <https://open-vsx.org> with GitHub and accept the publisher agreement.
2. Create an access token under *Settings → Access Tokens*, and create the namespace once: `npx ovsx create-namespace <publisher-id> -p <token>`.
3. Publish the same file: `npx ovsx publish learning-dojo-<version>.vsix -p <token>`.

## Releasing a new version

1. Update `CHANGELOG.md`, bump `version` (or use `vsce publish minor`).
2. `npm test && npm run verify` (needs both a C++ compiler and Go 1.22+ for a full check).
3. Tag the commit (`git tag v0.1.1 && git push --tags`) and publish to both registries.

## Sharing without a registry

`npm run package` produces a `.vsix`. Anyone can install it with *Extensions → … → Install from VSIX…* or `code --install-extension learning-dojo-0.1.0.vsix`.

## Automating it

Store the two tokens as repository secrets (`VSCE_PAT`, `OVSX_PAT`) and publish from a GitHub Actions job on tags: `npx vsce publish -p $VSCE_PAT` and `npx ovsx publish -p $OVSX_PAT`. The CI workflow in `.github/workflows/ci.yml` already builds and tests on every push.
