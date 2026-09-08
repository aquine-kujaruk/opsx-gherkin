# Implementation verification

Completed on 2026-09-08. A fresh project copy with no `node_modules`, build, or
coverage directory passed `pnpm install --frozen-lockfile` followed by
`pnpm verify` on Node 22.23.2. The same verification also passed on Node 24.20.0.
The copy's source, tests, tooling, skill, and documentation match the working
repository byte for byte.

Both runs passed 72 tests across seven files, lint without warnings, strict
type checking, executable build, publint, and the installed-package smoke test.
Core coverage: 98.37% lines, 96.12% statements, 96.87% functions, 91.72% branches;
all configured thresholds passed. Strict OpenSpec change validation reported
no issues.

## Skill review

Local review used only the complete `skills/opsx-gherkin` bundle and its own
commands. This was a content and executable-example review, not an independent
agent evaluation.

| Representative request | Guidance and evidence |
| --- | --- |
| Write a main specification in MDG for conversion | The entry point identifies Feature/Purpose, Rule/Requirement, normative wording, typed steps, tags, and scoped Backgrounds. The account example converts into its bundled OpenSpec and plain Gherkin counterparts. |
| Represent a delta with each operation | The contract gives the delta Feature tag, each operation tag, and canonical rename endpoints. The authentication example preserves ADDED, MODIFIED, REMOVED, and RENAMED. Extra removal or rename content is rejected. |
| Preserve outlines, tables, and a JSON Doc String | The account example has two Examples groups and four expanded cases including ordinary scenarios. Tests inspect actual headers, rows, tags, literal values, and substituted arguments using the pinned Cucumber parser. |
| Convert unsupported syntax or start from plain Gherkin | The direction table exposes only the three supported conversions. The guidance distinguishes endpoint validation from profile eligibility and requires reporting unsupported content without inventing a mapping. |

The review clarified table indentation, separator handling, pipe/backslash/newline
escaping, Doc String indentation, and placeholder binding directly in `SKILL.md`.
Its frontmatter passes the skill-creator validator. Copied-bundle checks resolve
every entry-point reference without files from the development checkout.

## Distribution and release checks

- `npm pack --dry-run --ignore-scripts --json`: 27 intentional package files;
  five executable entries, complete skill, one canonical profile, and public
  documentation. Source files, tests, local planning, and temporary output are
  excluded.
- `scripts/smoke-package.mjs`: installs the actual tarball with production
  dependencies; checks every executable, all three directions, both main and
  delta examples, direct endpoint validation, npm/npx invocation, and exact
  profile/instructions output. Removing the installed canonical file produces
  an I/O failure instead of a hidden fallback.
- Workflow YAML parses successfully. CI selects Node 22 and 24 and invokes
  `pnpm verify`. Publication is manually dispatched on `main`, uses the `npm`
  environment, and runs verification before semantic-release.
- All configured release plugins load. Commitlint accepts a valid Conventional
  Commit and rejects an invalid message. A regression test confirms patch,
  minor, and major classification, including `!` and `BREAKING CHANGE:` forms.
  The conventionalcommits preset corrects the initial default preset's failure
  to recognize `feat!:`.

## Scope

The package and skill contain no author-workspace paths or references to external
authoring skills, generators, or agent workflow orchestration. Verification does
not execute those integrations. No remote, registry release, or personal skill
installation was created. Publication still requires the real repository URLs,
npm ownership and trusted-publisher setup, and release-triggering Git history
described in `CONTRIBUTING.md`.

All 22 maintained prototype files match the SHA-256 hashes recorded in
`source-baseline.json`. The implementation did not modify personal agent settings.
