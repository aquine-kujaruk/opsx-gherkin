# Contributing

Use Node.js 22.18+ and the pnpm version declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm verify
```

The only canonical compatibility contract is
[OPENSPEC_MDG_PROFILE.feature.md](skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md).
Read it before changing conversion behavior or syntax guidance. Update the
relevant Rule/Scenario before introducing a compatibility correction; a new
mapping needs an explicit contract change. Keep examples executable and update
their generated counterparts when behavior changes.

Parsing and rendering operate on the typed document model. Keep filesystem I/O
and command diagnostics at the CLI boundary. Official validators remain behind
their shared adapter and pinned during compatibility-preserving maintenance.

Tests must examine actual interpreted structures and values, including expanded
Examples. Parser acceptance and stable text alone cannot establish preservation.
Package tests must use the installed tarball and the bundled skill resources.
`pnpm test` rebuilds commands before process tests; `pnpm test:coverage` also
checks coverage thresholds. `pnpm test:package` builds and verifies npm/npx in
an isolated temporary consumer directory.

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.). Mark public
interface incompatibilities with `!` or a `BREAKING CHANGE:` footer. Check a
message with `pnpm exec commitlint --edit <message-file>`.

## Release setup

The repository includes a manually dispatched release workflow. Before its first run:

1. Configure the real Git remote and add its actual repository, homepage, and
   issue URLs to package metadata. No destination is assumed by this repository.
2. Confirm npm ownership/availability for `opsx-gherkin` and register the GitHub
   workflow as a trusted publisher for that package, permitting `npm publish`.
   Use workflow filename `release.yml` and environment name `npm` in that configuration.
3. Configure the GitHub `npm` environment and repository permissions as desired.
   The workflow requests an OIDC token for npm provenance and uses the repository's
   `GITHUB_TOKEN` for release notes. No npm token is stored in the project.
4. Establish the release history. The package retains the prototype's `1.0.0`
   baseline; semantic-release determines the published version from tags and
   Conventional Commits. A first release requires a release-triggering commit.
5. Run `pnpm verify`, then dispatch the Release workflow on `main`.

The release job verifies before invoking semantic-release. Versioning, changelog,
and release-note configuration live in `release.config.mjs`. Local verification
and package smoke checks do not upload artifacts or require publishing credentials.

Trusted publisher requirements: [npm documentation](https://docs.npmjs.com/trusted-publishers/).
