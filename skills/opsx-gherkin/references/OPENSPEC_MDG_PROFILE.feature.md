`@contract` `@openspec` `@mdg`
# Feature: Lossless OpenSpec, Markdown with Gherkin, and Gherkin interoperability

This document is the normative contract for the conversion profile. The converters SHALL preserve the domain structure represented here and SHALL reject mappings not defined here.

## Background: Official validation

* Given the OpenSpec 1.11.0 strict validator is available
* And the Cucumber Gherkin 42.0.1 Markdown and plain-text parsers are available

`@main-spec` `@feature-level`
### Scenario: Preserve a scenario outside a Rule

* Given a valid feature-level scenario
* When it is converted to OpenSpec
* Then it is stored in the reserved **@mdg-feature-scenarios** Requirement
* And the reserved Requirement is removed when converting back to MDG

`@main-spec` `@mapping`
## Rule: Map document and requirement structure

The converter SHALL map a Gherkin Feature to an OpenSpec title and Purpose, and SHALL map every ordinary Rule to a Requirement with the same name and normative description.

### Background: A valid normative Rule

* Given every ordinary Rule description contains `SHALL` or `MUST`

`@purpose`
### Scenario: Map Feature metadata

* Given an MDG Feature with a name, description, and tags
* When it is converted to OpenSpec
* Then the name is written as the level-one title
* And the description is written under `## Purpose`
* And the tags remain backticked tags adjacent to the title

`@requirements`
### Scenario: Map Rules to Requirements

* Given the following structural correspondence:

  | MDG | OpenSpec |
  | --- | --- |
  | Feature | title and Purpose |
  | Rule | Requirement |
  | Rule description | normative requirement text |
  | Scenario | Scenario |
* When either representation is converted
* Then names, descriptions, tags, and child order are preserved

`@background`
### Scenario: Map shared setup

* Given a Feature Background
* When it is converted to OpenSpec
* Then it is written as a readable `**Background:**` block in the Requirements preamble
* But a Rule Background is written as `#### Background:` inside its Requirement

`@canonical-example`
### Scenario: Show complete canonical documents

* Given this canonical OpenSpec profile document:

  ```markdown
  `@authentication`
  # Account access

  ## Purpose

  Allow registered users to access their accounts securely with verified credentials.

  ## Requirements

  **Background:**

  - **GIVEN** the authentication service is available

  `@credentials`
  ### Requirement: Registered users can sign in

  The system SHALL grant access when a registered user supplies correct credentials.

  `@smoke`
  #### Scenario Outline: Verify credentials

  - **WHEN** the user submits `<password>`
  - **THEN** access is `<decision>`

  ##### Examples: Decisions

    | password | decision |
    | --- | --- |
    | correct-password | granted |
    | wrong-password | rejected |
  ```
* Then its canonical Markdown with Gherkin representation is:

  ```markdown
  `@authentication`
  # Feature: Account access

  Allow registered users to access their accounts securely with verified credentials.

  ## Background:

  * Given the authentication service is available

  `@credentials`
  ## Rule: Registered users can sign in

  The system SHALL grant access when a registered user supplies correct credentials.

  `@smoke`
  ### Scenario Outline: Verify credentials

  * When the user submits `<password>`
  * Then access is `<decision>`

  #### Examples: Decisions

    | password | decision |
    | --- | --- |
    | correct-password | granted |
    | wrong-password | rejected |
  ```

`@behavior` `@full-api`
## Rule: Preserve behavioral Gherkin constructs

The converter SHALL preserve Scenario and Scenario Outline structure, typed steps, tags, Examples, Data Tables, and Doc Strings without treating them as opaque prose.

`@scenario`
### Scenario: Map typed steps

* Given a Scenario containing Given, When, Then, And, and But steps
* When it is converted to OpenSpec
* Then each step uses a Markdown list item with its uppercase keyword in bold
* And conversion back restores the corresponding English Gherkin keyword

`@outline` `@examples`
### Scenario Outline: Preserve outlines and Examples groups

* Given an Outline with `<groups>` Examples groups
* When it completes an OpenSpec round-trip
* Then all `<groups>` groups retain their names, tags, descriptions, headers, and rows

`@single-group`
#### Examples: One group

  | groups |
  | --- |
  | 1 |

`@multiple-groups`
#### Examples: Several groups

  | groups |
  | --- |
  | 3 |

`@datatable` `@docstring`
### Scenario: Preserve step arguments

* Given a step with this Data Table:

  | field | value |
  | --- | --- |
  | status | active |
  | attempts | 4 |
* And a step with this Doc String:

  ```json
  {
    "error": "invalid_credentials"
  }
  ```
* When the document completes a round-trip
* Then table cells, Doc String media type, and Doc String content are unchanged

`@feature-output` `@projection`
## Rule: Project OpenSpec to a plain Gherkin feature

The `opsx-to-feature` command SHALL parse OpenSpec through the same intermediate model as `opsx-to-mdg` and MUST emit plain-text Gherkin accepted by the official parser.

### Scenario: Render plain Gherkin syntax

* Given a valid OpenSpec main specification
* When `opsx-to-feature` converts it
* Then Feature, Rule, Background, Scenario, Scenario Outline, Examples, steps, Data Tables, Doc Strings, descriptions, and tags use plain Gherkin syntax
* And structural Markdown headings, list markers, backticked tags, and table separator rows are absent
* And the output is suitable for a `.feature` file

### Scenario: Render an OpenSpec delta as Gherkin

* Given a valid OpenSpec delta
* When `opsx-to-feature` converts it
* Then the Feature and Rules retain the reserved delta tags defined by this contract
* And RENAMED retains its canonical FROM and TO requirement names

`@delta` `@mapping`
## Rule: Represent OpenSpec deltas idiomatically in MDG

The converter SHALL mark a delta Feature with **@openspec-delta** and SHALL represent each delta operation as a Rule carrying exactly one reserved operation tag.

`@delta-operations`
### Scenario Outline: Map every delta operation

* Given an OpenSpec `<operation>` requirement
* When it is converted to MDG
* Then its Rule carries `<tag>`
* And converting it back restores the `<operation>` section

#### Examples: Supported operations

  | operation | tag |
  | --- | --- |
  | ADDED | @openspec-added |
  | MODIFIED | @openspec-modified |
  | REMOVED | @openspec-removed |
  | RENAMED | @openspec-renamed |

`@renamed`
### Scenario: Preserve both names of a rename

* Given a RENAMED requirement
* When it is represented as an MDG Rule
* Then the Rule description contains canonical FROM and TO lines:

  ```text
  FROM: `### Requirement: Old name`
  TO: `### Requirement: New name`
  ```

`@validation` `@round-trip`
## Rule: Validate and normalize every conversion

The converter SHALL validate both endpoints with their official deterministic validators and MUST emit only a canonical result whose normalized model equals the input model.

### Scenario: Complete a successful conversion

* Given a source document accepted by its official validator and this profile
* When either converter runs
* Then the generated document is accepted by the destination validator
* And parsing the generated document produces the same normalized model

`@error`
### Scenario: Reject an undefined mapping

* Given valid source syntax containing structure outside this profile
* When conversion is attempted
* Then the command exits with status 1
* And no destination document is emitted
* And diagnostics identify the unsupported structure

`@profile-boundaries`
### Scenario: Reject removal metadata without a defined mapping

* Given a REMOVED Requirement or Rule containing prose, a Background, or scenarios
* When conversion is attempted
* Then the command reports that REMOVED supports only the requirement name
* And no content is silently discarded

`@profile-boundaries`
### Scenario: Reject extra rename content

* Given a RENAMED Rule containing content beyond its canonical FROM and TO names
* When conversion is attempted
* Then the command reports the unsupported content
* And no destination document is emitted

`@ordering`
### Scenario: Preserve the order of delta operation groups

* Given a compatible delta with its MODIFIED group before its ADDED group
* When the delta completes a round-trip
* Then MODIFIED still precedes ADDED
* And requirement order within each group is unchanged

`@cli`
## Rule: Support symmetric command input and output

All converter commands SHALL accept one path, inline text, or stdin and SHALL return text on stdout or write one destination path atomically.

### Scenario Outline: Select an input source

* Given input is supplied through `<source>`
* When the converter starts
* Then that source is read without guessing whether literal text is a path

#### Examples: Input modes

  | source |
  | --- |
  | positional path |
  | --text |
  | stdin |

### Scenario: Protect an existing output

* Given the destination path already exists
* When conversion is requested without `--force`
* Then the command exits with status 2
* And the existing file remains unchanged

`@agent-discovery`
### Scenario: Discover the profile before authoring a specification

* Given a human or agent has installed this package
* When it runs `npx opsx-gherkin --help`
* Then the help directs it to the `profile` command before generating a specification
* And the help distinguishes `.feature.md` output from `.feature` output
* When it runs `npx opsx-gherkin profile`
* Then stdout contains this complete normative contract without a duplicated summary
