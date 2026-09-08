## 1. Migration baseline and project foundation

- [x] 1.1 Record the prototype's maintained files, command/options inventory, pinned validators, and eight-test baseline from `/home/eaquine/Documents/Codex/2026-09-02/new-chat-2`; verify the baseline with its existing test command and keep the source directory unchanged.
- [x] 1.2 Initialize local Git if absent and establish ESM, strict TypeScript, pnpm, Biome, Vitest, tsdown, and the declared Node runtime policy; verify dependency installation, type checking, and executable build entry points while preserving the existing OpenSpec files.
- [x] 1.3 Place the source contract at `skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md`, update contributor instructions to reference it, and adopt maintained sample inputs as fixtures; verify the copied contract matches the source and that no root duplicate, scratch directory, or session-output directory was imported.

## 2. Typed conversion core and official validation

- [x] 2.1 Port the shared document model and MDG/OpenSpec readers into typed modules, including main/delta classification, reserved tags, backgrounds, scenarios, Examples, tables, and Doc Strings; verify expected model fields against explicit main and delta fixture assertions.
- [x] 2.2 Port OpenSpec, MDG, and plain Gherkin renderers and add the plain Gherkin model reader needed for preservation checks; verify all three supported conversions with official parser acceptance and expected descriptions, tags, argument values, and expanded-example counts.
- [x] 2.3 Centralize the pinned official validators behind shared adapters, isolating the internal OpenSpec lookup and temporary delta-validation files; verify accepted/rejected endpoint fixtures and cleanup after both success and failure.
- [x] 2.4 Enforce profile constraints and normalized input/output equality before emission; verify main and delta round-trips, feature-level scenarios, multiple Examples groups, unsupported structures, and a detected preservation mismatch without adding new mappings.

## 3. CLI compatibility and contract discovery

- [x] 3.1 Migrate the main dispatcher and three standalone converters, preserving paths/`--text`/stdin, output aliases, `--name`, `--project-root`, `--force`, diagnostics, and exit codes; verify equivalent invocation results, conflicting-input errors, atomic replacement, and unchanged destinations after conversion failure.
- [x] 3.2 Migrate `validate-spec` onto the shared endpoint adapters while retaining its format options, suffix defaults, structured output, and exit codes; verify valid, invalid, and unreadable files and a syntactically valid document outside the conversion profile.
- [x] 3.3 Resolve `profile` and `instructions` from the canonical file inside the packaged skill and preserve help-based discovery; verify exact stdout equality, argument rejection, and invocation from an unrelated working directory.

## 4. Independent compatibility skill

- [x] 4.1 Use the skill-creator guidance to author `skills/opsx-gherkin/SKILL.md` with syntax/compatibility triggers, relative references, supported directions, and command usage; verify its frontmatter and confirm it contains no dependency or reference to external authoring skills, generators, or workflow orchestration.
- [x] 4.2 Provide self-contained referenced examples and guidance covering main specs, supported delta operations, reserved tags, outlines, tables, and Doc Strings; execute their documented conversions and verify the intended model values and row counts with the pinned official validators.
- [x] 4.3 Review the complete skill against representative main-spec, delta, outline/table, and unsupported-syntax requests; verify it explains the contract boundaries and correct commands using only its bundled material, and record any corrected guidance without running external workflow integration exercises.

## 5. Package and contributor experience

- [x] 5.1 Configure the npm package's five executable entries, explicit file allowlist, runtime dependencies, version baseline, MIT license, and accurate metadata; inspect a dry-run pack to verify commands and the complete skill are included, the profile occurs only under skill references, and local/test-only files are excluded.
- [x] 5.2 Implement `scripts/smoke-package.mjs` using a local tarball and clean production installation; verify all declared binaries, all supported conversion directions, main/delta validation, npm/npx execution, profile equality, and a copied skill's local references without publishing.
- [x] 5.3 Write README, CONTRIBUTING, and SECURITY documentation covering installation, command examples, declared Node support, skill bundle copying, verification, contract ownership, and release preparation; verify documented local commands and relative links against the built/packed artifact and use remote URLs only if a real remote exists.

## 6. Verification and release preparation

- [x] 6.1 Add `pnpm verify` and CI for Node.js 22 and 24, covering lint, types, focused behavior tests, the design's coverage thresholds, build, package metadata checks, and package smoke; verify the local command succeeds and workflow configuration invokes the same checks.
- [x] 6.2 Configure Conventional Commits, semantic-release, changelog generation, and a manually dispatched release workflow that verifies before publication; validate the configuration and document publisher setup still required, without creating a remote or uploading a release.
- [x] 6.3 Run the complete verification from a clean dependency installation and review the final package/skill against all three capability specs; report the verified commands, any remaining external publication setup, and confirmation that the original prototype and personal agent settings were not modified.
