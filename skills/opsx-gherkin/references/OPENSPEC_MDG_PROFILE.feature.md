`@code` `@contract`
# Feature: Convert a compatible specification

This document is the normative contract for the conversion profile. The converters SHALL preserve the domain structure represented here and SHALL reject mappings not defined here.

Its Rules and Scenarios specify the converter, and their structure demonstrates valid Markdown with Gherkin. To author a specification for another domain, express that domain's requested behavior using the demonstrated structure and the compatibility rules in this complete contract.

The **@code** target identifies software as this Feature’s verification boundary. Descriptive tags such as **@contract** are optional example metadata. A new main specification may omit them; conversion of an existing document must preserve its tags. Markers in the reserved **@openspec-** and **@mdg-** namespaces have only the structural roles defined below.

The separate [profile-access use case](profile-access.feature.md) specifies how to find and retrieve this contract.

## Background: Official validation

* Given the OpenSpec 1.11.0 strict validator is available
* And the Cucumber Gherkin 42.0.1 Markdown and plain-text parsers are available

### Scenario: Preserve a scenario outside a Rule

* Given a valid feature-level scenario
* When it is converted to OpenSpec
* Then it is stored in the reserved **@mdg-feature-scenarios** Requirement

### Scenario: Restore a scenario outside a Rule

* Given a compatible OpenSpec main spec containing the reserved **@mdg-feature-scenarios** Requirement
* When it is converted to MDG
* Then its scenarios become Feature-level scenarios
* And the reserved Requirement wrapper is removed

`@mapping`
## Rule: Map document and requirement structure

The converter SHALL map a Gherkin Feature to an OpenSpec title and Purpose, and SHALL map every ordinary Rule to a Requirement with the same name and normative description.

### Background: A valid normative Rule

* Given every ordinary Rule description contains `SHALL` or `MUST`

`@purpose`
### Scenario: Map Feature metadata

* Given an MDG Feature with a name, description, and optional descriptive tags
* When it is converted to OpenSpec
* Then the name is written as the level-one title
* And the description is written under `## Purpose`
* And any supplied tags remain backticked tags adjacent to the title
* And an untagged Feature does not acquire illustrative tags from this contract

### Scenario: Map Rules to Requirements

* Given the following structural correspondence:

  | MDG | OpenSpec |
  | Feature | title and Purpose |
  | Rule | Requirement |
  | Rule description | normative requirement text |
  | Scenario | Scenario |
* When either representation is converted
* Then names, descriptions, tags, and child order are preserved
* And optional tags in a newly authored document do not permit dropping metadata from an existing source

### Scenario: Map shared setup

* Given a compatible MDG main spec with both a Feature Background and a Rule Background
* When the specification is converted to OpenSpec
* Then it is written as a readable `**Background:**` block in the Requirements preamble
* And the Rule Background is written as `#### Background:` inside its Requirement

### Scenario: Convert a complete sign-in specification to MDG

* Given this compatible OpenSpec document:

  ```markdown
  `@code`
  # Sign in with account credentials

  ## Purpose

  Give an active account access when the submitted credentials match its registered credentials.

  ## Requirements

  **Background:**

  - **GIVEN** the authentication service is available

  `@credentials`
  ### Requirement: Matching credentials grant access

  The system SHALL grant access to an active account when submitted credentials match and SHALL reject a nonmatching password.

  `@accepted`
  #### Scenario Outline: Grant access for matching credentials

  - **GIVEN** an active account has registered email `<registered_email>` and password `<registered_password>`
  - **WHEN** a user signs in with email `<submitted_email>` and password `<submitted_password>`
  - **THEN** access to the account registered as `<expected_email>` is granted

  ##### Examples: Matching credentials

    | registered_email | registered_password | submitted_email | submitted_password | expected_email |
    | --- | --- | --- | --- | --- |
    | user@example.com | correct-password | user@example.com | correct-password | user@example.com |

  `@rejected`
  #### Scenario Outline: Reject access for a nonmatching password

  - **GIVEN** an active account has registered email `<registered_email>` and password `<registered_password>`
  - **WHEN** a user signs in with email `<submitted_email>` and password `<submitted_password>`
  - **THEN** access is rejected

  ##### Examples: Nonmatching password

    | registered_email | registered_password | submitted_email | submitted_password |
    | --- | --- | --- | --- |
    | user@example.com | correct-password | user@example.com | wrong-password |
  ```
* When the document is converted to MDG
* Then the destination is:

  ```markdown
  `@code`
  # Feature: Sign in with account credentials

  Give an active account access when the submitted credentials match its registered credentials.

  ## Background:

  * Given the authentication service is available

  `@credentials`
  ## Rule: Matching credentials grant access

  The system SHALL grant access to an active account when submitted credentials match and SHALL reject a nonmatching password.

  `@accepted`
  ### Scenario Outline: Grant access for matching credentials

  * Given an active account has registered email `<registered_email>` and password `<registered_password>`
  * When a user signs in with email `<submitted_email>` and password `<submitted_password>`
  * Then access to the account registered as `<expected_email>` is granted

  #### Examples: Matching credentials

    | registered_email | registered_password | submitted_email | submitted_password | expected_email |
    | user@example.com | correct-password | user@example.com | correct-password | user@example.com |

  `@rejected`
  ### Scenario Outline: Reject access for a nonmatching password

  * Given an active account has registered email `<registered_email>` and password `<registered_password>`
  * When a user signs in with email `<submitted_email>` and password `<submitted_password>`
  * Then access is rejected

  #### Examples: Nonmatching password

    | registered_email | registered_password | submitted_email | submitted_password |
    | user@example.com | correct-password | user@example.com | wrong-password |
  ```

## Rule: Preserve behavioral Gherkin constructs

The converter SHALL preserve Scenario and Scenario Outline structure, typed steps, tags, Examples, Data Tables, and Doc Strings without treating them as opaque prose.

Canonical MDG tables SHALL contain an indented header followed directly by data rows, without Markdown separator rows. Canonical OpenSpec tables SHALL retain their Markdown separator rows. Compatible MDG inputs with or without separators SHALL preserve the same interpreted rows and values.

### Scenario: Map typed steps

* Given a Scenario containing Given, When, Then, And, and But steps
* When it is converted to OpenSpec
* Then each step uses a Markdown list item with its uppercase keyword in bold

### Scenario: Restore English typed step roles

* Given a compatible OpenSpec Scenario containing bold GIVEN, WHEN, THEN, AND, and BUT list items
* When it is converted to MDG
* Then each step retains its corresponding English Gherkin keyword

`@outline`
### Scenario Outline: Preserve `<expected_groups>` Examples groups in `<target_format>`

* Given a compatible `<source_format>` main spec with an Outline containing `<source_groups>` Examples groups
* When it is converted to `<target_format>`
* Then the Outline has `<expected_groups>` Examples groups
* And each group retains its name, tags, description, headers, and rows

`@single-group`
#### Examples: One group

  | source_format | target_format | source_groups | expected_groups |
  | MDG | OpenSpec | 1 | 1 |
  | OpenSpec | MDG | 1 | 1 |

`@multiple-groups`
#### Examples: Several groups

  | source_format | target_format | source_groups | expected_groups |
  | OpenSpec | MDG | 3 | 3 |
  | MDG | OpenSpec | 3 | 3 |

### Scenario Outline: Preserve literal step arguments in `<target_format>`

* Given a compatible `<source_format>` main spec with a scenario step containing this Data Table:

  | field | value |
  | status | active |
  | attempts | 4 |
* And another step in the same scenario containing this Doc String:

  ```json
  {
    "error": "invalid_credentials"
  }
  ```
* When the document is converted to `<target_format>`
* Then table cells, Doc String media type, and Doc String content are unchanged

#### Examples: Argument conversion directions

  | source_format | target_format |
  | MDG | OpenSpec |
  | OpenSpec | MDG |

## Rule: Project OpenSpec to a plain Gherkin feature

The `opsx-to-feature` command SHALL preserve the same normalized behavioral model as `opsx-to-mdg` and MUST emit plain-text Gherkin accepted by the official parser.

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

## Rule: Represent OpenSpec deltas idiomatically in MDG

The converter SHALL mark a delta Feature with **@openspec-delta** and SHALL represent each delta operation as a Rule carrying exactly one reserved operation tag.

### Scenario Outline: Map every delta operation

* Given an OpenSpec `<operation>` requirement
* When it is converted to MDG
* Then its Rule carries `<tag>`


#### Examples: Supported operations

  | operation | tag |
  | ADDED | @openspec-added |
  | MODIFIED | @openspec-modified |
  | REMOVED | @openspec-removed |
  | RENAMED | @openspec-renamed |

### Scenario Outline: Restore the `<operation>` section from its reserved marker

* Given a compatible MDG delta with a Rule carrying `<tag>` and the content required for that operation
* When the delta is converted to OpenSpec
* Then the entry belongs to the `<operation>` section
* And its requirement identity and supported content are preserved

#### Examples: Operation identities

  | operation | tag |
  | ADDED | @openspec-added |
  | MODIFIED | @openspec-modified |
  | REMOVED | @openspec-removed |
  | RENAMED | @openspec-renamed |

### Scenario Outline: Preserve the rename from `<old_name>` to `<new_name>`

* Given a compatible OpenSpec delta renaming the requirement `<old_name>` to `<new_name>`
* When the delta is converted to MDG
* Then the Rule description contains canonical FROM and TO lines:

  ```text
  FROM: `### Requirement: <old_name>`
  TO: `### Requirement: <new_name>`
  ```

#### Examples: Renamed requirements

  | old_name | new_name |
  | Login audit | Authentication audit |

## Rule: Validate and normalize every conversion

The converter SHALL validate both endpoints with their official deterministic validators and MUST emit only a canonical result whose normalized model equals the input model.

### Scenario: Complete a successful conversion

* Given a source document accepted by its official validator and this profile
* When either converter runs
* Then the generated document is accepted by the destination validator
* And parsing the generated document produces the same normalized model

### Scenario Outline: Reject a Rule without normative wording

* Given a syntactically valid MDG main spec whose ordinary Rule description contains neither SHALL nor MUST
* When conversion to OpenSpec is requested
* Then the command exits with status `<exit_status>`
* And no destination document is emitted
* And diagnostics identify the Rule that lacks normative wording

#### Examples: Invalid profile outcome

  | exit_status |
  | 1 |

### Scenario: Reject removal metadata without a defined mapping

* Given a REMOVED Requirement or Rule containing prose, a Background, or scenarios
* When conversion is attempted
* Then the command reports that REMOVED supports only the requirement name
* And no content is silently discarded

### Scenario: Reject extra rename content

* Given a RENAMED Rule containing content beyond its canonical FROM and TO names
* When conversion is attempted
* Then the command reports the unsupported content
* And no destination document is emitted

### Scenario Outline: Preserve delta group order in `<target_format>`

* Given a compatible `<source_format>` delta with its MODIFIED group before its ADDED group
* When the delta is converted to `<target_format>`
* Then MODIFIED still precedes ADDED
* And requirement order within each group is unchanged

#### Examples: Ordered delta conversion directions

  | source_format | target_format |
  | OpenSpec | MDG |
  | MDG | OpenSpec |

## Rule: Support symmetric command input and output

All converter commands SHALL accept one path, inline text, or stdin and SHALL return text on stdout or write one destination path atomically.

### Scenario Outline: Select an input source

* Given input is supplied through `<source>`
* When the converter starts
* Then that source is read without guessing whether literal text is a path

#### Examples: Input modes

  | source |
  | positional path |
  | --text |
  | stdin |

### Scenario Outline: Preserve an existing destination without overwrite permission

* Given a compatible MDG source is available
* And the destination `<destination>` already contains a document
* When conversion to OpenSpec is requested at `<destination>` without `--force`
* Then the command exits with status `<exit_status>`
* And the bytes in `<destination>` remain unchanged

#### Examples: Protected destination

  | destination | exit_status |
  | account.spec.md | 2 |
