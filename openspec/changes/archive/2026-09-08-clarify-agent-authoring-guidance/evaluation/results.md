# Authoring evaluation results

All six first drafts satisfied the supplied domain rubric and passed official endpoint validation and supported conversion. No draft required a repair. This sample shows no improvement in document correctness over the original guidance.

## Before / after

| Case | Original first draft | Revised first draft | Domain review | Repairs |
| --- | --- | --- | --- | --- |
| Minimal | [Pass](runs/original/minimal/draft.feature.md) | [Pass](runs/revised/minimal/draft.feature.md) | One normative Rule and one Scenario; active M-17, available B-42, reservation and confirmation preserved; no incidental tags or converter behavior | None / none |
| Arguments | [Pass](runs/original/arguments/draft.feature.md) | [Pass](runs/revised/arguments/draft.feature.md) | One Outline, Accepted/Rejected groups, three cases (1 accepted, 2 accepted, 0 rejected); table and JSON preserve the pipe and decoded backslash; JSON copies are numeric | None / none |
| Delta | [Pass](runs/original/delta/draft.feature.md) | [Pass](runs/revised/delta/draft.feature.md) | Four operations in order; exact requirement names; M-17/L-8 renewal count 0→1 and M-17/B-42 reservations 2→3; removal and rename boundaries preserved | None / none |

Each linked run directory also contains the unchanged final MDG, CLI-generated OpenSpec/plain Gherkin, raw diagnostics and repair notes. [checks.json](checks.json) records independent checks for all 12 draft/final artifacts. [plan.json](plan.json) contains the fixed prompts, pre-edit rubric and original revision/hashes; [protocol.md](protocol.md) describes reproduction and settings.

The revised delta adds that L-8 belongs to M-17 as scenario setup. It preserves the requested behavior; ownership was not an explicit supplied fact. No new normative ownership restriction was introduced.

## Observed guidance defect

The [original delta run](runs/original/delta/diagnostics.md) invoked the standalone OpenSpec validator, which expects a main spec and rejected the delta's operation sections. The document itself passed the converters' official strict delta validation. The revised skill explains this distinction; the [revised delta run](runs/revised/delta/diagnostics.md) used conversion for delta validation and had no failed command. This is one observed workflow difference, not evidence of a general performance improvement.

All domain behaviors were reviewed against the original prompts. Nothing copied the contract's converter requirements or descriptive tags. Independent checks confirm expanded cases, literal argument values, operation identities, official validation, and converter model preservation. No authoring reruns or repairs were needed.

## Implementation verification

- `openspec validate clarify-agent-authoring-guidance --strict`: passed.
- `pnpm verify`: passed; 72 tests, type/lint/build checks, coverage, publint, and package smoke (30 files). Packaged `profile`/`instructions` match the canonical resource exactly; copied-bundle links resolve.
- Skill creator's `quick_validate.py`: passed.
- `node openspec/changes/clarify-agent-authoring-guidance/evaluation/check.mjs`: all 12 draft/final checks passed.
- Revised bundle hashes match the evaluated snapshot. All six first drafts equal their final MDG files byte-for-byte.
- Contract review: orientation, metadata clarification and selected descriptive tags changed; embedded examples, normative mappings and reserved-marker definitions retained. No conversion source, CLI interface, dependencies or validator versions changed.

During verification, an initial contract edit used backticked tag references inside prose, which the MDG parser interpreted as structural tags. Using bold references fixed it. The new test initially expected title-case step keywords instead of the model's uppercase keywords; its expectation was corrected. The evidence checker initially read prose from Cucumber's Markdown AST, which omits descriptions, and expected MDG backticks in the plain rename projection. It now inspects the validated plain projection for descriptions and checks each format's rename syntax. These were implementation/checker corrections; evaluation drafts were unchanged. All affected checks were rerun successfully.

## Limits

One run per case/version, same inherited configuration, fresh contexts. Exact model build, seed, temperature, tokens and timing were not exposed. Access isolation was instruction-based. No existing main-spec project was supplied for delta cross-reference checks. This exercise supports only the observations above; successful round-trips establish syntax and preservation, not reliable agent authoring across unseen tasks.
