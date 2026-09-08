`@code`
# Feature: Access specification conversion guidance

Find the supported output formats and retrieve the canonical conversion profile before authoring a compatible specification. The [canonical mapping contract](OPENSPEC_MDG_PROFILE.feature.md) defines the mappings; this Feature specifies access to that resource.

## Background:

* Given the opsx-gherkin package is installed with its canonical profile resource

## Rule: Help identifies the profile and supported output formats

The CLI SHALL direct readers to the profile before authoring and SHALL distinguish Markdown with Gherkin output from plain Gherkin output.

### Scenario: Find the profile command in help

* When the user requests `opsx-gherkin --help`
* Then the help directs the user to `opsx-gherkin profile` before authoring
* And the help distinguishes `.feature.md` from `.feature` output

## Rule: Profile commands return the complete canonical resource

The profile and instructions commands SHALL return the canonical mapping contract verbatim on stdout and SHALL exit with status 0.

### Scenario Outline: Retrieve the canonical contract through `<command>`

* When the user runs `opsx-gherkin <command>`
* Then stdout equals the complete installed canonical resource byte for byte
* And the command exits with status `<exit_status>`

#### Examples: Resource commands

  | command | exit_status |
  | profile | 0 |
  | instructions | 0 |
