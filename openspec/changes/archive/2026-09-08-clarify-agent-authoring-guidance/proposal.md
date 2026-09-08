## Why

The canonical contract describes the converter using the same Gherkin structures an agent is expected to author, but does not explicitly explain that relationship. The teaching specifications must also agree with the user's gherkin-craft conventions when an agent uses both skills. Dense descriptive tags and an example that introduces several constructs together can lead an agent to copy incidental metadata or confuse converter requirements with the intended application's behavior.

## What Changes

- Keep the metagherkin contract as the single normative mapping reference and add a brief orientation explaining its subject, its role as an example, and how to apply it to another domain.
- Distinguish optional descriptive tags from reserved conversion markers. Reduce descriptive tags in the contract while retaining representative metadata at Feature, Rule, Scenario/Outline, and Examples levels.
- Connect the skill's authoring instructions to a minimal main-spec example with a code target and a single-row Outline and the existing richer main-spec and delta examples. Require reading the canonical contract before authoring, as today.
- Model every completed teaching Feature as one public use case, with target metadata, meaningful named arguments, independent scenarios and separate acceptance/rejection cases. Separate profile access from conversion; identify the delta as a structural change-document demonstration.
- Preserve accepted syntax, reserved markers, conversion directions and model guarantees. Emit canonical MDG tables without separator rows, retaining OpenSpec separators and accepting both input forms.
- Assess the guidance with a small, reproducible authoring exercise covering a minimal main spec, tables/outlines, and a delta. Record generated documents, semantic review, validator results, and limitations separately from deterministic conversion checks; introduce no evaluation service or agent workflow dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `compatibility-guidance`: Orient agents and align all teaching examples with the accepted gherkin-craft modeling conventions, without a runtime dependency.
- `format-conversion`: Emit canonical MDG tables without formatting-only separators while preserving interpreted rows and values.

## Impact

- Documentation: `skills/opsx-gherkin/SKILL.md`, its canonical contract, and bundled examples.
- Verification: existing contract and example validation/preservation tests; a bounded authoring evaluation recorded with the change's implementation evidence.
- The `profile` and `instructions` commands will expose the revised canonical text through the existing resource lookup. MDG table rendering changes; CLI/API, parser acceptance, validator versions and dependencies remain unchanged.
- The intended benefit is better agent authoring. Increased reliability is a hypothesis to evaluate, not a guarantee established by the contract's own round-trip test.

The initial six-run exercise remains historical evidence. The accepted refinement uses gherkin-craft during maintenance and independent editorial review; the shipped skill and CLI remain self-contained.
