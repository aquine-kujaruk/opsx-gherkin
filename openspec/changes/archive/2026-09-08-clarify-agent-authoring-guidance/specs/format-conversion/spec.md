## MODIFIED Requirements

### Requirement: Preserve the documented behavioral model

The converters SHALL preserve the profile-defined names, descriptions, tags, child order, shared setup, scenarios, outlines, Examples groups and values, step keywords, Data Tables, and Doc Strings. Canonical MDG tables SHALL omit Markdown separator rows while canonical OpenSpec tables SHALL retain them. Compatible separator-bearing and separator-free MDG inputs SHALL preserve the same interpreted rows and values. Preservation SHALL be assessed using normalized document structure and values rather than formatting identity or parser acceptance alone.

#### Scenario: Preserve an ordinary main specification
- **GIVEN** a compatible main specification containing Feature metadata, Rules, scoped Backgrounds, and scenarios
- **WHEN** it completes an OpenSpec-to-MDG-to-OpenSpec round-trip
- **THEN** its normalized behavioral model is unchanged

#### Scenario: Preserve expanded examples and step arguments
- **GIVEN** a compatible outline containing two Examples groups, tags, a Data Table, and a typed Doc String
- **WHEN** it completes a supported round-trip
- **THEN** the Examples groups, their intended row counts and values, and the step arguments are preserved
- **AND** structural formatting does not introduce additional example rows or alter literal values

#### Scenario: Preserve feature-level scenarios
- **GIVEN** a compatible MDG document containing a scenario outside a Rule
- **WHEN** it is converted to OpenSpec and back to MDG
- **THEN** the reserved Requirement represents that scenario in OpenSpec and is removed in MDG as defined by the profile

#### Scenario: Project into plain Gherkin
- **GIVEN** a compatible OpenSpec specification containing tags, outlines, tables, and Doc Strings
- **WHEN** the user converts it with `opsx-to-feature`
- **THEN** the plain Gherkin result preserves the normalized behavioral model and has no structural Markdown headings, bullet markers, or formatting-only table separators

#### Scenario: Normalize table formatting without changing cases
- **GIVEN** equivalent compatible MDG documents with and without separator rows
- **WHEN** each is converted to OpenSpec and back to MDG
- **THEN** both produce the same canonical MDG without separators and the same canonical OpenSpec with separators
- **AND** their Examples cases, DataTable values and normalized models remain unchanged
