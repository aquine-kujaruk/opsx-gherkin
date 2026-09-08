# Modeling refinement — 2026-09-08

The final teaching bundle follows the user-requested gherkin-craft conventions. Independent editorial review returned **ready** after one correction/recheck cycle. This result concerns the complete revised bundle; the earlier six-run exercise in `results.md` and `runs/` remains evidence for the earlier version only.

## Coverage retained and clarified

| Document | Final coverage |
| --- | --- |
| Canonical contract | One public conversion use case; metadata, Feature/Rule mapping, both Background scopes, feature-level scenarios, English typed steps, 1/3 Examples groups in both directions, literal DataTable/DocString arguments in both directions, all delta operations and rename endpoints, ordering in both directions, official validation, input selection and protected output. 35 expanded examples. |
| Embedded pair | Complete OpenSpec→MDG request; account facts, distinct stored/submitted credentials, accepted and rejected scenarios, both equivalent documents validated by tests. |
| Profile access | Separate guidance-access Feature: help discovery and exact retrieval through profile/instructions. 3 independent requests. |
| Minimal | @code; one Rule and one single-row Outline; product identity, requested quantity and expected quantity bound separately. 1 case. |
| Account | Success, unknown account, incorrect password, fifth-failure locking, and independent locked-account/correct-password rejection. Cohesive credential DataTables, distinct credential roles, fixed five-failure policy, two rejected Examples groups, JSON arguments and meaningful But retained. 5 cases. |
| Delta | Explicit structural change-document demonstration; complete added/modified examples, exact four operation identities, name-only removal/rename and original rename endpoints. 2 cases. |

All five distributed MDG Features parse, inherit @code in every expanded example and have one action per example. The hypothetical application behavior remains illustrative; no application implementation or test generator was executed.

## Independent review

The creator and editor read the complete gherkin-craft guidance, raw examples and candidate. Editor `aligned_editor` read the complete contract, both embedded documents, skill entry point, profile companion and all nine example files, and compared the original specifications.

Initial findings:

1. Replacing round-trip scenarios with single actions had omitted some reverse-direction examples. Added independent cases for both directions at group counts 1/3, argument preservation and delta ordering.
2. Markdown backticks around Outline arguments survived into native teaching examples. Removed only those formatting spans from authored sources and regenerated all counterparts; bindings, tags and literal payloads remained intact.

Full recheck: **ready**, no remaining supported findings. One correction cycle used of the permitted two. Subsequent whitespace cleanup removed indentation on blank source-fence lines; the full conversion/model tests passed again.

## Formatting and compatibility

Canonical MDG now omits table separators; canonical OpenSpec retains them. Both installed Cucumber 42.0.1 parsers preserved exactly two Examples cases and the same DataTable cells with and without separators. [refinement.json](refinement.json) retains the probe inputs, parser versions, observed values, final case/target/action counts and bundle hashes.

This follows gherkin-craft's separator-free MDG style without repeating its stale explanation that separators become data. The external feat2test repository was not changed. The runtime remains independent of other skills/generators. Existing separator-bearing inputs, untagged documents, plain Scenarios, tags, CLI commands and validator versions remain supported. Only canonical MDG table formatting changes.

## Verification

- `openspec validate clarify-agent-authoring-guidance --strict`: passed.
- Skill creator `quick_validate.py`: passed.
- `pnpm verify`: passed — 74 tests in 7 files, lint/types/build/coverage, publint and installed-package smoke (32 files).
- Focused tests inspect target inheritance, action counts, argument roles and values, all sign-in outcomes, parsed MDG/native equality, embedded document equivalence, profile access, both separator input forms and recursive copied-bundle links.
- Packaged profile and instructions commands still return the sole canonical resource byte-for-byte. All three example families pass official endpoint/conversion checks; the delta uses the official strict delta endpoint through conversion.

The editorial result establishes no broad improvement in agent performance. The earlier raw authoring drafts/results were preserved, and no new six-run benchmark claim is made for this refinement.
