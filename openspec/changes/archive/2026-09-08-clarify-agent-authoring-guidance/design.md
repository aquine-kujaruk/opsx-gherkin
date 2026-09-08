## Context

See [proposal.md](proposal.md) for the motivation. The bundle already separates the skill entry point, the canonical metagherkin contract, and complete account/delta examples. The CLI prints the same contract resource. Existing tests parse and convert that resource and verify example models and expanded cases.

This design resolves ambiguity about how much metadata to retain, where orientation belongs, and what verification can establish. The guidance requirements are recorded in [the capability delta](specs/compatibility-guidance/spec.md).

## Goals / Non-Goals

**Goals:**

- Make the contract's subject and example role explicit for both skill and CLI readers.
- Use the existing document model and validation machinery to check all revised examples.
- Make agent-authoring observations reproducible without adding runtime dependencies.

**Non-Goals:**

- Changing conversion eligibility, reserved-marker semantics, CLI options, or validator versions.
- Removing metadata from user inputs, inventing domain policy, or requiring another skill at runtime.
- Building an evaluation platform, making stochastic agent runs a CI gate, or proving a general model-performance improvement from a small sample.

## Decisions

### 1. Keep the contract in MDG and put orientation inside its Feature description

Add a short opening paragraph explaining that this document specifies the converter and illustrates syntax. Tell agents to apply its compatibility constraints while expressing their own requested domain behavior. Explain that its descriptive labels are optional examples and reserved structural markers retain their contract-defined roles.

Keep this prose after the Feature heading and before child structures so it remains ordinary Feature description in the supported model. Do not add free-standing instructional headings that the parser could interpret as new structure. Clarify tag optionality in the existing metadata preservation scenarios without changing their mappings.

An orientation only in `SKILL.md` would miss CLI readers. Replacing the contract with prose would lose its valid, convertible example role. A second mapping guide would introduce another authority to maintain.

### 2. Retain tags for demonstration rather than topic indexing

Use @code for the completed software Features and keep representative descriptive tags at Rule, Scenario/Outline and Examples levels. Rewrite the embedded pair with complete setup and separate accepted/rejected examples, preserving the constructs and both outcomes. Remove redundant topic labels elsewhere in the outer contract; use existing names and prose to identify those sections.

Keep all reserved-marker references and delta examples intact. Do not rename illustrative metadata into reserved namespaces. Make clear that this editorial reduction concerns the contract itself: conversion of a tagged source still preserves its metadata.

Keeping all topic tags preserves avoidable density. Removing every descriptive tag would stop the contract demonstrating tag placement and preservation at supported levels. The richer account fixture remains additional coverage; its fixed credentials and counts become meaningful arguments with distinct stored/submitted roles. Its five-failure policy stays fixed, and correct-password rejection while locked gets its own independent scenario.

### 3. Add a minimal complete example and route readers by need

Add `references/examples/minimal.feature.md`, `minimal.openspec.md`, and `minimal.feature`. The MDG document has @code, a meaningful Feature description, one normative Rule, and one single-row Scenario Outline. Product identity, requested quantity and resulting quantity have separate meaningful bindings. Generate its equivalent representations using the existing converters.

In the skill, retain the requirement to read the complete contract first, then point to the minimal example for basic authoring, the account example for shared setup/outlines/arguments, and the authentication delta for operations. Keep all links relative and inside the bundle. Explain these roles briefly instead of repeating the canonical mapping rules.

An abstract skeleton alone would not demonstrate a complete valid input. Simplifying the existing account example would discard useful complex-construct coverage. The additional minimal example gives each a distinct purpose.

### 4. Separate deterministic verification from an authoring exercise

Use existing contract, CLI resource, and bundled-example checks. Extend the existing example checks to include the minimal family and inspect one expanded case, expected steps, equivalent models, and the code target and explicit argument bindings. Avoid tests that merely assert documentation wording or count tags. Review the contract against the retained coverage map, including both conversion directions and the relocated profile-access use case; round-trip the revised contract against its own model. Its teaching scenarios, metadata and formatting intentionally differ from the initial version.

The initial six-run exercise is retained under evaluation with its original prompts, settings, drafts and results. It tested library-domain authoring before the gherkin-craft refinement; it does not validate the final teaching conventions. The accepted refinement uses the independent editorial and deterministic verification described below. Every final compatible example still requires official validation, supported conversion and domain-content review. No statistical effectiveness claim or additional benchmark service is introduced.

## Risks / Trade-offs

- Extra orientation becomes more prose to interpret → keep it short, place it before examples, and avoid duplicating mapping definitions.
- Removing illustrative tags is mistaken for permission to strip metadata → explicitly distinguish new authoring from conversion of an existing source.
- A new example increases maintenance → generate counterparts through the CLI and include them in existing semantic example checks.
- A small agent sample is noisy or unavailable → preserve raw evidence and settings, report limitations, and make no broad effectiveness claim.
- An editorial change accidentally alters compatibility → limit rendering changes to MDG separators, review the contract diff, use official validators and model checks, and run `pnpm verify`.

## Migration Plan

1. Retain the captured original guidance and six-run authoring evidence as historical input.
2. Apply the accepted modeling refinement to the contract, profile companion, example families and self-contained skill guidance.
3. Update MDG table rendering and regenerate counterparts; extend semantic checks, complete independent editorial review, and record final verification separately.
4. Ship the revised bundle through the existing packaging process. The profile commands continue to expose the resource verbatim; consumers need no syntax migration.

Rollback consists of reverting the guidance, example families, MDG table rendering and associated verification additions together. There is no persistent state migration.

## Accepted modeling refinement

The user requested alignment with gherkin-craft after the initial implementation. Tasks 1–4 and evaluation/runs record that earlier bundle; their results do not establish conformity of this final revision. Preserve that evidence unchanged and record the refinement separately.

Keep OPENSPEC_MDG_PROFILE.feature.md as the sole mapping authority and give it one conversion use case. Move help/profile access into a companion profile-access.feature.md with independent requests and a link to the canonical resource. Preserve all mappings, shared scopes, typed steps, metadata, groups, literal arguments, delta operations/order, validation, I/O and discovery coverage. Literal source documents being converted remain data, not arbitrary Outline arguments.

Completed authored Features carry an asset target; the hypothetical applications and converter use @code. The authentication delta is explicitly a structural change-document demonstration, not one completed application use case; its added/modified behavior still needs full preconditions and meaningful arguments. Removal and rename remain name-only. Compatibility still accepts untagged input and plain Scenarios and must not insert editorial metadata during conversion.

Both installed Cucumber 42.0.1 parsers preserve the same intended Examples/DataTable rows with and without separators. Adopt separator-free authored and canonical MDG; retain canonical OpenSpec separators. Update the contract before a representation choice in the shared table writer. The external skill’s claim that separators become data is not true for these installed parsers; document the finding without editing feat2test or adding a runtime dependency.

Revise self-contained guidance, regenerate counterparts through the CLI, and extend semantic checks for targets, arguments, all sign-in outcomes, the profile companion, embedded documents and both table input forms. Preserve broad input-acceptance coverage in existing test fixtures. Use a fresh independent editor against the complete candidate, original text and coverage map, with at most two correction/recheck cycles. Run strict validation and pnpm verify, and store final review/check evidence and bundle hashes separately from the initial six-run experiment.
