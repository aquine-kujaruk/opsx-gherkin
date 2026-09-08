## Purpose

Allow users to convert and validate specification documents deterministically while preserving the structures defined by the published compatibility profile.

## ADDED Requirements

### Requirement: Preserve the supported conversion interface

The CLI SHALL provide `opsx-gherkin mdg-to-opsx`, `opsx-gherkin opsx-to-mdg`, and `opsx-gherkin opsx-to-feature`, and SHALL retain the equivalent standalone converter executables. Conversion support SHALL be limited to the directions and structures defined by the canonical compatibility profile.

#### Scenario: Convert Markdown with Gherkin into OpenSpec
- **GIVEN** a `.feature.md` document accepted by the official parser and compatibility profile
- **WHEN** the user runs `mdg-to-opsx`
- **THEN** the result is an officially valid OpenSpec document with the corresponding specification kind and behavior

#### Scenario: Convert OpenSpec into either supported Gherkin representation
- **GIVEN** an OpenSpec document accepted by the official validator and compatibility profile
- **WHEN** the user selects `opsx-to-mdg` or `opsx-to-feature`
- **THEN** the result uses the selected Markdown or plain Gherkin syntax and passes its official parser

#### Scenario: Use a standalone converter
- **GIVEN** the same supported input and options
- **WHEN** the user runs a standalone converter instead of its `opsx-gherkin` subcommand
- **THEN** the output, diagnostics, and exit status have the same behavior

### Requirement: Preserve the documented behavioral model

The converters SHALL preserve the profile-defined names, descriptions, tags, child order, shared setup, scenarios, outlines, Examples groups and values, step keywords, Data Tables, and Doc Strings. Preservation SHALL be assessed using normalized document structure and values rather than formatting identity or parser acceptance alone.

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

### Requirement: Preserve profile-defined delta representations

The converters SHALL distinguish main specifications from deltas and preserve the profile-defined representations of ADDED, MODIFIED, REMOVED, and RENAMED operations, including reserved tags and both names of a rename. Acceptance SHALL not imply support for structures outside the profile.

#### Scenario: Round-trip a supported delta
- **GIVEN** a compatible delta containing each supported operation
- **WHEN** it is converted to MDG and back to OpenSpec
- **THEN** the operation kinds, affected requirement names, supported content, and rename endpoints are unchanged

#### Scenario: Project a delta into plain Gherkin
- **GIVEN** a delta accepted by the compatibility profile
- **WHEN** the user runs `opsx-to-feature`
- **THEN** the output retains the reserved delta and operation tags and the canonical rename names

#### Scenario: Reject an unsupported delta structure
- **GIVEN** a syntactically valid source delta containing a structure for which the profile defines no mapping
- **WHEN** conversion is requested
- **THEN** conversion fails with a diagnostic identifying the unsupported structure and emits no destination document

### Requirement: Validate before emitting a conversion

Every conversion SHALL validate its input and output with the official endpoint validators, enforce the compatibility profile, and verify normalized model preservation before emitting a destination document. OpenSpec validation SHALL use strict mode. Invalid syntax, unsupported mappings, and preservation failures SHALL leave the destination unchanged.

#### Scenario: Reject a Rule without normative text
- **GIVEN** an MDG Rule whose description lacks the normative wording required by the profile
- **WHEN** conversion to OpenSpec is requested
- **THEN** the command reports the incompatible Rule, exits with status 1, and writes no result to stdout

#### Scenario: Protect a destination after failed validation
- **GIVEN** an existing destination and a source that fails endpoint or profile validation
- **WHEN** conversion is requested with that destination and `--force`
- **THEN** the command exits with status 1 and preserves the existing destination bytes

#### Scenario: Reject a conversion that changes example values
- **GIVEN** a source accepted by its validator and profile
- **WHEN** the generated output parses successfully but its normalized example values differ from the source
- **THEN** conversion fails before the output is emitted

### Requirement: Preserve explicit input selection and protected output

All converter commands SHALL accept one input path, inline `--text`, or stdin; retain `--name` and `--project-root`; and return text on stdout or write an output path selected through `-o` or `--output`. Existing output paths SHALL require `--force`. A destination update SHALL be atomic, and ambiguous input selection SHALL be rejected.

#### Scenario: Select an input mode
- **GIVEN** the same compatible document supplied as a file, inline text, or stdin with equivalent name and project context
- **WHEN** the same conversion is performed through each input mode
- **THEN** each invocation returns the same canonical result

#### Scenario: Reject conflicting input sources
- **WHEN** a user supplies both an input path and `--text`
- **THEN** the converter exits with status 2, explains the conflict, and emits no destination document

#### Scenario: Refuse to overwrite an existing output
- **GIVEN** a valid source and an existing destination
- **WHEN** conversion is requested without `--force`
- **THEN** the command exits with status 2 and leaves the existing destination unchanged

#### Scenario: Replace an output explicitly
- **GIVEN** a valid source and an existing destination
- **WHEN** conversion is requested with `--force`
- **THEN** the destination is replaced atomically with the complete validated output and the command exits with status 0

### Requirement: Preserve actionable command outcomes

Converter commands SHALL use exit status 0 for success, 1 for syntax/profile/conversion validation failure, and 2 for usage or I/O failure. Successful conversion text SHALL be written only to the selected output channel; failure diagnostics SHALL be written to stderr with enough context to identify the problem.

#### Scenario: Report unreadable input
- **WHEN** a user requests conversion of a missing input file
- **THEN** the command reports the I/O problem on stderr, exits with status 2, and writes no conversion result to stdout

#### Scenario: Keep successful stdout usable as a document
- **WHEN** a supported conversion succeeds without an output path
- **THEN** stdout contains only the complete converted document and the command exits with status 0

### Requirement: Retain standalone endpoint validation

The `validate-spec` executable SHALL retain direct validation of OpenSpec, MDG, and plain Gherkin using their official validators, including existing format selection and suffix-based defaults. It SHALL report a structured validation result with status 0 for valid input, 1 for invalid input, and 2 for usage or I/O failure. Endpoint validity SHALL be distinguished from eligibility for conversion under the compatibility profile.

#### Scenario: Validate without converting
- **GIVEN** a valid document in one of the supported endpoint formats
- **WHEN** the user runs `validate-spec` with the matching format
- **THEN** the command reports its validity and does not create a converted document

#### Scenario: Validate syntax outside the conversion profile
- **GIVEN** a Gherkin document accepted by its official parser but outside the conversion profile
- **WHEN** the user requests standalone endpoint validation
- **THEN** validation reports the endpoint syntax result without asserting that conversion will succeed
