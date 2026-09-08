## MODIFIED Requirements

### Requirement: Own a single canonical compatibility contract

The skill SHALL own `OPENSPEC_MDG_PROFILE.feature.md` within its references as the canonical mapping contract. Skill guidance and CLI behavior SHALL agree with that contract. The distribution SHALL not maintain another normative copy at its root or embedded in executable code. The contract SHALL remain valid Markdown with Gherkin and SHALL explain at its beginning that its Rules and Scenarios describe the converter, while its structure illustrates the format for authoring specifications about other domains. That orientation SHALL remain available when the contract is read directly through the CLI.

#### Scenario: Locate the contract from the skill entry point
- **WHEN** a user opens the skill's `SKILL.md`
- **THEN** they can follow a relative reference to the complete `OPENSPEC_MDG_PROFILE.feature.md` within the same skill bundle

#### Scenario: Retrieve the contract through the existing CLI commands
- **GIVEN** an installed distribution
- **WHEN** a user runs `opsx-gherkin profile` or `opsx-gherkin instructions`
- **THEN** stdout contains exactly the canonical contract shipped in the skill references and the command exits with status 0

#### Scenario: Discover the contract from command help
- **WHEN** a user runs `opsx-gherkin --help`
- **THEN** the help directs them to `profile` before authoring compatible specifications and distinguishes `.feature.md` from `.feature` output

#### Scenario: Interpret a contract about the converter
- **GIVEN** an agent reads the contract to author a specification for an unrelated application
- **WHEN** it reads the opening orientation
- **THEN** the document identifies the converter as the subject of its own Rules and Scenarios
- **AND** it explains that the agent must express the requested application's behavior using the demonstrated structure and applicable compatibility rules
- **AND** it identifies the contract's descriptive tags as optional example metadata

#### Scenario: Retain a valid self-describing document
- **GIVEN** the contract with its orientation and illustrative metadata
- **WHEN** the contract is parsed and converted through a supported round-trip
- **THEN** the official endpoint validators accept it and its normalized model is preserved

### Requirement: Explain preservation practices and profile limits

The skill SHALL explain the profile's treatment of Feature metadata, Rule/Requirement mappings, scoped Backgrounds, typed steps, Scenario Outlines, Examples, Data Tables, Doc Strings, reserved tags, and delta operations. It SHALL distinguish compatible syntax from general parser acceptance and distinguish normalized preservation from identical formatting. The guidance SHALL explicitly distinguish optional descriptive tags from the reserved structural markers defined by the canonical contract, and SHALL explain that removing illustrative tags while drafting a new document is different from dropping existing metadata during conversion. The contract SHALL use a small representative set of descriptive tags to demonstrate their supported placement, without presenting its topic labels as an authoring checklist.

#### Scenario: Recognize a reserved-tag constraint
- **WHEN** a user consults the guidance about document tags
- **THEN** it explains the reserved tags and their supported structural roles so that user metadata is not mistaken for conversion instructions

#### Scenario: Preserve table and outline interpretation
- **WHEN** a user follows the guidance for Examples or Data Tables
- **THEN** the documented syntax preserves intended row counts and values under the supported official parsers
- **AND** the guidance explains relevant indentation, escaping, and placeholder conventions

#### Scenario: Recognize an unsupported source structure
- **WHEN** a user consults the skill about a structure outside the profile
- **THEN** the guidance identifies the compatibility boundary and directs them to the documented validation behavior without inventing a mapping or promising general lossless conversion

#### Scenario: Author without copying incidental metadata
- **GIVEN** an agent is authoring a new main specification without a requested tag taxonomy
- **WHEN** it follows the contract and skill guidance
- **THEN** the guidance explicitly permits omission of illustrative descriptive tags
- **AND** it does not require copying labels from the converter's own domain into the new specification

#### Scenario: Preserve existing tags during conversion
- **GIVEN** an existing compatible document contains descriptive tags
- **WHEN** an agent follows the guidance to convert that document
- **THEN** the guidance requires preserving those tags with the rest of the documented model
- **AND** optionality during new authoring is not presented as permission to delete source metadata

#### Scenario: Identify delta operations through reserved markers
- **GIVEN** an agent authors an MDG delta
- **WHEN** it consults the tag guidance
- **THEN** it is directed to the canonical Feature and operation markers
- **AND** descriptive topic labels are not presented as substitutes for those markers

### Requirement: Keep examples and reference links usable independently

Every bundled example presented as compatible SHALL satisfy the syntax and conversion claims made about it, and every local reference needed to use the skill SHALL resolve within the distributed skill bundle. Examples SHALL demonstrate format compatibility without requiring an application implementation or agent workflow. The skill SHALL retain the instruction to read the full canonical contract before authoring and SHALL provide a route from a minimal main-spec example with target metadata and named Outline arguments to the existing richer main-spec and delta examples. The minimal example SHALL include a meaningful Feature description, one normative Rule, and one single-row Scenario Outline with explicit product, requested-quantity and expected-quantity arguments and a code verification target, with equivalent OpenSpec and plain Gherkin documents. The guidance SHALL distinguish example validity and conversion preservation from evidence of agent authoring effectiveness.

#### Scenario: Verify a documented conversion example
- **GIVEN** a bundled example claiming a supported conversion and expected result
- **WHEN** its documented command is executed with the installed CLI
- **THEN** the result is accepted by its official validator and preserves the claimed structure and values

#### Scenario: Use a copied skill bundle
- **GIVEN** the complete skill directory copied outside the source repository
- **WHEN** the user follows its local references
- **THEN** the contract and required supporting material remain readable without absolute author-workspace paths or files outside the bundle

#### Scenario: Start from the smallest demonstrated main specification
- **GIVEN** an agent needs a main specification with one behavior and no shared setup
- **WHEN** it follows the skill's starting example after reading the contract
- **THEN** it finds a complete MDG document containing a Feature description, a code verification target, a normative Rule, and a single-row Scenario Outline with meaningful argument bindings
- **AND** it can inspect equivalent OpenSpec and plain Gherkin documents within the bundle
- **AND** the documented conversions preserve that example's structure and values

#### Scenario: Select examples for additional constructs
- **WHEN** an agent needs shared setup, outlines, multiple Examples groups, step arguments, or delta operations
- **THEN** the skill identifies which bundled example demonstrates those constructs
- **AND** it presents those examples as applications of the canonical contract rather than separate mapping authorities

#### Scenario: Interpret verification evidence accurately
- **WHEN** an agent reads guidance about the contract's and examples' successful validation and conversion
- **THEN** that evidence is described as syntax and preservation verification
- **AND** it is not presented as proof that agents consistently author correct specifications from new requirements

## ADDED Requirements

### Requirement: Model teaching specifications as complete use cases

Completed Features in the distributed skill SHALL each express one public use case and carry metadata identifying the asset boundary being verified. Scenarios SHALL supply compatible prior facts, one complete action or query and discriminating consequences. Meaningful example scalars SHALL use named Outline arguments, including single-row cases; independently variable roles SHALL remain distinct. Fixed criteria SHALL stay in their Rules, cohesive records SHALL remain data, and literal source documents SHALL remain inputs when conversion examines them. Acceptance and rejection SHALL use separate scenarios. These authoring conventions SHALL not add runtime dependencies or narrow converter input eligibility.

#### Scenario: Follow the small teaching example
- **WHEN** an agent follows the minimal cart example
- **THEN** product identity, requested quantity and expected quantity have separate bindings and the Feature identifies the software boundary

#### Scenario: Preserve sign-in coverage during reformulation
- **WHEN** an agent reads the complete account example
- **THEN** success, unknown-account rejection, incorrect-password rejection, fifth-failure locking and locked-account rejection remain independently assessable
- **AND** stored and submitted credentials remain distinct without making the five-failure threshold configurable

#### Scenario: Read a complete conversion example
- **WHEN** an agent reads the paired documents in the canonical contract
- **THEN** the source precedes an explicit conversion action and the expected destination follows it
- **AND** embedded application examples provide their own facts and separate accepted and rejected outcomes

#### Scenario: Distinguish conversion from profile access
- **WHEN** an agent follows the skill references
- **THEN** conversion mappings have one canonical contract and profile access has a separate complete Feature
- **AND** the companion preserves help discovery and exact profile retrieval without duplicating mappings

#### Scenario: Interpret the delta demonstration
- **WHEN** an agent opens the bundled delta example
- **THEN** its description identifies a change-document representation rather than a completed application use case
- **AND** added/modified behavior has complete scenarios while removed/renamed entries retain the canonical name-only boundaries

#### Scenario: Preserve broader compatible inputs
- **GIVEN** a compatible existing source without target tags or containing a plain Scenario
- **WHEN** the converter processes it
- **THEN** it preserves that model without inserting tags, inventing arguments or requiring another skill
