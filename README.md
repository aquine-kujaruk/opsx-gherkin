# opsx-gherkin

Deterministic conversion between OpenSpec and Gherkin, with a self-contained
skill explaining compatible syntax. Requires Node.js 22.18+.

## Convert a specification

```sh
npx opsx-gherkin mdg-to-opsx input.feature.md -o spec.md
npx opsx-gherkin opsx-to-mdg spec.md -o output.feature.md
npx opsx-gherkin opsx-to-feature spec.md -o output.feature
```

The supported directions are Markdown with Gherkin to OpenSpec, OpenSpec to
Markdown with Gherkin, and OpenSpec to plain Gherkin. Plain `.feature` input is
available for direct validation only.

Each converter accepts one input path, inline `--text`, or stdin. With no `-o`,
the result goes to stdout. Existing destinations require `--force`; successful
file writes are atomic. Invalid conversions leave the destination unchanged.

```sh
npx opsx-gherkin mdg-to-opsx < input.feature.md
npx opsx-gherkin opsx-to-feature --text "$(cat spec.md)"
npx opsx-gherkin opsx-to-mdg --help
```

`--name` supplies a name when OpenSpec input lacks a title or usable source-path
context. `--project-root` supplies main-spec context for delta validation.
`--output` is an alias for `-o`. Standalone `mdg-to-opsx`, `opsx-to-mdg`, and
`opsx-to-feature` executables accept the same options after installation.

## Compatibility

Read the complete contract before authoring compatible documents:

```sh
npx opsx-gherkin profile
```

`instructions` is an alias. Both print the same
[canonical contract](skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md)
owned by the bundled skill.

Conversions validate both endpoints with the pinned official OpenSpec and
Cucumber validators and compare their normalized models. They preserve the
documented structure and values while normalizing formatting. Syntax outside
the compatibility profile produces a diagnostic instead of an inferred mapping.
Supported delta operations include ADDED, MODIFIED, REMOVED, and RENAMED; the
contract defines their allowed content.

Complete examples: [account access](skills/opsx-gherkin/references/examples/account.feature.md)
and [authentication delta](skills/opsx-gherkin/references/examples/authentication-delta.feature.md).

## Validate syntax directly

```sh
npx --package opsx-gherkin validate-spec --format openspec spec.md
npx --package opsx-gherkin validate-spec --format mdg input.feature.md
npx --package opsx-gherkin validate-spec --format feature output.feature
```

The validator emits JSON. Without `--format`, `.feature.md` selects MDG,
`.feature` selects plain Gherkin, and other suffixes select OpenSpec. The legacy
`--format gherkin` alias selects MDG for `.feature.md` and plain Gherkin otherwise.
Direct OpenSpec validation checks a main specification; converters also validate
supported deltas. Valid endpoint syntax alone does not establish convertibility.

Exit codes: `0` success, `1` invalid syntax/profile/conversion, `2` usage or I/O
failure. Conversion diagnostics go to stderr; stdout remains usable as a document.

## Use the syntax skill

The package contains [skills/opsx-gherkin](skills/opsx-gherkin/SKILL.md), including
its contract and examples. To obtain it locally:

```sh
npm install --save-dev opsx-gherkin
```

Copy the **complete** `node_modules/opsx-gherkin/skills/opsx-gherkin` directory to
the skill location supported by your agent. Keep the references beside
`SKILL.md`. The skill explains syntax and conversion independently; installing
the npm package does not activate it or change agent settings automatically.

## Development

```sh
pnpm install --frozen-lockfile
pnpm verify
```

Verification includes lint, types, tests and coverage, build, package checks,
and a production installation of the actual tarball. It needs registry access
to install dependencies and does not publish. `pnpm test:package` runs the
package checks separately. Supported Node versions are tested in CI.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contract changes and release setup,
[SECURITY.md](SECURITY.md) for security reporting, and [LICENSE](LICENSE) for MIT terms.
