## Purpose

Provide self-contained guidance for writing syntax compatible with the supported OpenSpec and Gherkin conversions and expose the same canonical contract to CLI users.

## ADDED Requirements

### Requirement: Provide an independent syntax compatibility skill

The distribution SHALL include a skill named `opsx-gherkin` that explains supported format directions, structural correspondences, constraints, compatibility practices, examples, and conversion/validation commands. The skill SHALL be usable without another skill or generator and SHALL contain no instructions or references to external authoring skills, downstream generators, or agent workflow orchestration.

#### Scenario: Author a compatible representation using the skill
- **GIVEN** a user has the complete skill bundle and the intended specification content
- **WHEN** they consult the skill to represent that content in MDG for conversion to OpenSpec
- **THEN** its guidance identifies the required structure, normative wording, supported syntax, and relevant CLI validation and conversion commands
- **AND** following its guidance requires no separate authoring skill

#### Scenario: Choose a supported conversion
- **WHEN** a user consults the skill with plain Gherkin as the desired output
- **THEN** it identifies the supported OpenSpec-to-feature command and describes the applicable syntax
- **AND** it does not imply that every pair of formats supports conversion in both directions

### Requirement: Own a single canonical compatibility contract

The skill SHALL own `OPENSPEC_MDG_PROFILE.feature.md` within its references as the canonical mapping contract. Skill guidance and CLI behavior SHALL agree with that contract. The distribution SHALL not maintain another normative copy at its root or embedded in executable code.

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

### Requirement: Explain preservation practices and profile limits

The skill SHALL explain the profile's treatment of Feature metadata, Rule/Requirement mappings, scoped Backgrounds, typed steps, Scenario Outlines, Examples, Data Tables, Doc Strings, reserved tags, and delta operations. It SHALL distinguish compatible syntax from general parser acceptance and distinguish normalized preservation from identical formatting.

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

### Requirement: Keep examples and reference links usable independently

Every bundled example presented as compatible SHALL satisfy the syntax and conversion claims made about it, and every local reference needed to use the skill SHALL resolve within the distributed skill bundle. Examples SHALL demonstrate format compatibility without requiring an application implementation or agent workflow.

#### Scenario: Verify a documented conversion example
- **GIVEN** a bundled example claiming a supported conversion and expected result
- **WHEN** its documented command is executed with the installed CLI
- **THEN** the result is accepted by its official validator and preserves the claimed structure and values

#### Scenario: Use a copied skill bundle
- **GIVEN** the complete skill directory copied outside the source repository
- **WHEN** the user follows its local references
- **THEN** the contract and required supporting material remain readable without absolute author-workspace paths or files outside the bundle
