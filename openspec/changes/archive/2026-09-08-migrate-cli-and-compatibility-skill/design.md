## Context

See `proposal.md` for the motivation and the three capability specs for observable behavior.

The prototype is at `/home/eaquine/Documents/Codex/2026-09-02/new-chat-2`. It contains five executable entry points, an 828-line conversion module, shared CLI I/O, official validator adapters, a root-level profile, and eight passing tests. Its package is private and a dry-run pack includes tests and session outputs. The destination currently contains OpenSpec configuration and skills, with no application code or Git repository.

The prototype pins `@fission-ai/openspec` 1.11.0, `@cucumber/gherkin` 42.0.1, and `@cucumber/messages` 34.2.0. It accesses the OpenSpec validator through an internal module path. Its tests cover several canonical round-trips, but converter entry points currently check endpoint validity without comparing the entire normalized input and output models on every conversion.

The design artifact is required because this change moves the application, introduces a typed module structure and distributable skill, and changes how a runtime resource is located after packaging.

## Goals / Non-Goals

**Goals:**

- Preserve the documented conversion and CLI contract while giving parsing, rendering, validation, and I/O separate responsibilities.
- Keep one packaged compatibility contract, owned by an independently usable skill.
- Make published behavior verifiable from the package a consumer actually installs.
- Adopt the reference project's development practices without introducing a runtime dependency on that project.

**Non-Goals:**

- Integrations, hooks, custom schemas, or end-to-end exercises for OpenSpec proposal/apply workflows.
- References or dependencies on other authoring skills or test generators in the shipped product.
- New conversion directions, a public JavaScript library API, a plugin system, or an automatic skill installer.
- General domain modeling or teaching how to choose application behavior. The skill addresses syntax and compatibility practices for already intended content.
- Provisioning a remote repository, installing into personal agent settings, or uploading a public release during this change.

## Decisions

### 1. Migrate conservatively, then refactor behind the existing interface

Treat the prototype as a read-only migration source. Copy maintained source and useful sample content into this project; reclassify the `outputs/user-sign-in` sample as a test fixture instead of retaining an outputs directory. Do not copy dependencies, scratch directories, package archives, or session-generated results. Preserve the destination's existing OpenSpec setup.

Keep the three conversion directions and all five binary names. Preserve input modes, output options, context options, aliases, and exit status meanings. Existing profile-defined limitations, including supported delta content, remain explicit. Supporting additional OpenSpec workflow conventions is not part of this migration.

Alternative considered: rewrite the converter from the contract. A staged migration with characterization tests gives better evidence that behavior survives module and language changes. Corrections needed to satisfy the existing preservation contract must be distinguished from new mappings; a new mapping requires a separate scope decision.

### 2. Use TypeScript modules around a shared document model

Use ESM, strict TypeScript, pnpm with a committed lockfile, Biome, Vitest, and tsdown. Declare Node.js 22.18+ as the runtime baseline and verify on Node.js 22 and 24, following the reference project's support policy. Pin the existing runtime validator versions during migration; resolve compatible development tool versions when installing rather than changing the validator baseline as part of the refactor.

Suggested responsibility layout:

```text
src/
  cli.ts                    main command dispatcher
  bin/                      standalone converter and validator entry points
  cli/                      argument parsing, diagnostics, input and atomic output
  convert.ts                conversion orchestration
  model.ts                  typed document, delta, scenario, and argument structures
  parsers/                  OpenSpec, MDG, and plain Gherkin model readers
  renderers/                OpenSpec, MDG, and plain Gherkin output
  validation/               official adapters and profile constraints
  profile-resource.ts       packaged contract lookup
tests/
  fixtures/                 maintained conversion and failure examples
skills/
  opsx-gherkin/
    SKILL.md
    references/
      OPENSPEC_MDG_PROFILE.feature.md
      examples/             self-contained compatible example files
scripts/
  smoke-package.mjs
.github/workflows/
  ci.yml
  release.yml
```

The model represents main versus delta documents, rules and operations, feature-level scenarios, backgrounds, tags, ordered children, steps, Examples, tables, and Doc Strings. File paths, stdout, and temporary files remain outside parsing/rendering functions. No classes, service container, or separate workspace packages are needed.

Alternative considered: keep JavaScript and only rearrange files. TypeScript makes malformed intermediate states easier to detect during this particular conversion refactor; the small modules also permit tests at the boundaries where information can be lost.

### 3. Check semantic preservation as part of conversion

Use the flow `official input validation -> source model -> profile checks -> rendering -> official output validation -> output model -> normalized comparison -> emit`. Canonicalization may change whitespace, headings, or reserved synthetic wrappers, but it must not change profile-defined content.

Normalize only representation differences documented by the profile. Ignore parser-generated IDs and locations; account explicitly for the synthetic feature-scenario Requirement and delta tags. Preserve literal values, case where meaningful, descriptions, scoped backgrounds, child ordering, Examples groups/rows, and step arguments. Detecting a mismatch produces a conversion error before stdout or destination-file output.

Use fixture expectations to compare intended model values and expanded example counts as well as comparing models with one another. This prevents the same parser mistake on both sides from establishing false confidence. Do not add or remove Markdown table separators based on formatting intuition; verify their interpretation against the pinned official parsers.

Alternative considered: rely on parser validity and stable text round-trips. Those checks can both pass while the interpreted data is wrong, and do not fulfill the existing canonical profile's preservation promise.

### 4. Keep official validator compatibility behind one adapter

Both conversion and standalone validation use shared official-validator adapters, while endpoint syntax validation stays distinct from compatibility-profile enforcement. Preserve the standalone validator's supported public interface; it is not a conversion eligibility checker.

Retain the pinned OpenSpec dependency and isolate its internal validator lookup. Keep that dependency external to the bundled CLI so bundling does not rewrite the internal lookup into a nonexistent artifact. Verify loading and validating both a supported main document and a supported delta through the packed installation. Temporary delta-validation directories are private to the operation and cleaned up.

Alternative considered: replace the validator with a local approximation or broaden dependency versions during migration. Both would change the meaning of official compatibility. An upstream public validator API can be adopted separately when one is verified and useful.

### 5. Put the complete contract inside the skill

Use `skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md` as the only maintained contract file. Move the prototype document there, preserving its defined mappings. Update contributor instructions and test references to use that path. Any compatibility correction must update the relevant contract scenario before code is changed; do not create another normative summary in a source module or root document.

`SKILL.md` supplies a concise entry point: when to use the skill, which reference to read, how to choose a supported direction, how to author within the profile, and how to validate and convert. Compatibility practices cover required normative wording, headings, tags, scoped setup, outlines and bindings, tables and escaping, Doc Strings, delta tags, and unsupported constructs. Detailed syntax and examples remain in the linked references.

The skill contains all local references needed to use it and introduces no external skill or workflow. It is readable when copied as one directory. CLI installation and skill discovery remain separate: the README identifies the directory to copy, without installing it into agent settings or claiming automatic activation.

Keep `profile` and `instructions` as aliases for reading the same reference file. A single resource locator resolves the file from the installed package, never from the current working directory or the original workspace. Do not embed a second copy in the executable bundle.

Alternative considered: leave the root profile and have the skill link outside its directory. That would break a copied skill and contradict the requested ownership of syntax guidance.

### 6. Ship one package with two independently usable surfaces

Publish one npm package, `opsx-gherkin`, containing compiled commands and the complete `skills/opsx-gherkin` directory. Keep source skill files in place when packing rather than copying the profile into `dist`. Use an explicit `files` allowlist for `dist`, the skill directory, README, CONTRIBUTING, SECURITY, LICENSE, and CHANGELOG. Provide only CLI entry points and package metadata exports; do not establish a public programmatic API in this change.

Keep the initial package version at the prototype's `1.0.0` baseline and use MIT licensing as the reference project's default. These are planning defaults for preparing the package; a real registry release remains outside scope. Add accurate package description, keywords, runtime requirements, and usage instructions. Repository, homepage, and issue URLs must come from a configured real remote, not an invented destination.

Use Conventional Commits and semantic-release configuration for release versioning and notes. CI runs verification for pull requests and on the main branch; a separate manually dispatched release workflow verifies first and uses the configured repository's publishing credentials or trusted publisher. Actual publisher registration and release execution are follow-up operational work. Verification must work without registry publishing credentials.

Alternative considered: separate repositories or independently versioned packages for CLI and skill. Keeping both in one release prevents mismatched compatibility documentation while preserving their independent use.

### 7. Verify behavior, guidance, and the actual packed artifact

Provide focused conversion tests, CLI process tests, and a package smoke script behind `pnpm verify`. Include lint, type checking, coverage with meaningful thresholds, build, package metadata checks, and a clean production installation of the tarball. Use initial coverage floors of 90% lines/functions/statements and 80% branches for conversion modules; cover executable entry points through process and package tests.

Package smoke exercises all declared binaries, all three conversion directions, main and delta fixtures, direct endpoint validation, CLI profile/reference equality, relative skill links, and execution from an unrelated working directory. Test the npm/npx path against the local tarball, not a publicly uploaded package. Verification may fetch dependencies but must not upload releases.

Review the skill against self-contained authoring/conversion requests and supplied incompatible examples. Check whether its guidance selects the documented syntax, refers to the canonical contract, and explains the correct CLI diagnostics. Do not require execution of another authoring skill, OpenSpec planning/application workflows, or a downstream generator.

## Risks / Trade-offs

- **Internal OpenSpec validator path changes** -> Pin the runtime dependency, isolate access, and include clean-install main/delta validation in package smoke.
- **Existing tests omit a documented mapping or preserve the same mistake twice** -> Add explicit structural expectations and expanded-example checks for each supported construct before relying on normalized comparisons.
- **Moving the profile breaks a built or copied artifact** -> Package the complete skill at its stable relative path and test both an unrelated CLI working directory and a copied skill directory.
- **Guidance drifts from conversion behavior** -> Read the same canonical resource from the CLI and validate the conversion claims of bundled examples.
- **Refactoring changes undocumented incidental output** -> Preserve documented canonical behavior and report any correction against the relevant profile scenario; do not expand supported mappings implicitly.
- **Publication metadata cannot yet point to a real remote** -> Keep local build/package verification independent of remote setup; document the remaining release configuration without inventing URLs or publishing.
- **Runtime support is narrower than an undeclared prototype environment** -> Declare the selected minimum explicitly and test the declared Node versions before claiming support.

## Migration Plan

1. Record the source baseline and copy only maintained code and fixture inputs. Initialize a local Git repository if still absent, preserving the existing destination files; do not commit or create a remote as part of scaffolding. Place the profile directly in the future skill's references and update contributor references.
2. Establish the typed build/tooling and migrate the commands behind their current public interface. Keep characterization tests running as responsibilities move and resolve the runtime contract from its skill location.
3. Author the skill guidance and self-contained examples around the relocated canonical profile.
4. Add preservation checks, focused negative cases, and full package-resource verification.
5. Finish metadata, contribution/security documentation, CI, and release tooling; run the documented verification command from a clean installation.
6. Present the publishable local artifact and any external publisher setup still needed. Do not run proposal/apply integration exercises or publish a release.

The original prototype remains untouched as the rollback reference. No user data or external environment is migrated. Changes can be reviewed or reverted within the destination project before any release.
