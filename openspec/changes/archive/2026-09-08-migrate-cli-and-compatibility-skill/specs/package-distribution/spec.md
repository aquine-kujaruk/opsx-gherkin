## Purpose

Distribute the conversion commands and complete compatibility skill as a reproducible package that works independently of the original development workspace.

## ADDED Requirements

### Requirement: Distribute working commands and a complete skill bundle

The `opsx-gherkin` package SHALL include the supported executable commands, their required runtime resources, the complete skill directory and canonical profile, usage documentation, license information, and declared runtime requirements. Installing the package SHALL not modify a user's project configuration or personal agent settings.

#### Scenario: Use a production-only installation
- **GIVEN** a packed release installed with runtime dependencies in a clean consumer directory
- **WHEN** the user runs the main CLI, standalone converters, and standalone validator
- **THEN** those commands work without the development checkout or development dependencies

#### Scenario: Read the profile from an unrelated working directory
- **GIVEN** an installed package and a working directory outside that package
- **WHEN** the user runs its `profile` command
- **THEN** the complete bundled skill contract is returned without relying on the current working directory

#### Scenario: Discover how to use the bundled skill
- **WHEN** a user reads the distributed usage documentation
- **THEN** it identifies the included skill directory and how to copy the complete bundle for their agent without claiming that package installation activates it automatically

### Requirement: Publish only intentional package contents

The release package SHALL contain an explicit set of distributable files and SHALL exclude local scratch data, session outputs, development dependencies, and test-only fixtures. The canonical profile SHALL appear only in its skill reference location within the package.

#### Scenario: Inspect packed contents
- **WHEN** a maintainer packs the project for distribution
- **THEN** the archive includes the commands and complete skill and excludes scratch/session artifacts, test-only files, and a root-level copy of the profile

### Requirement: Verify the actual distribution reproducibly

Maintainers SHALL have a documented verification command that checks source quality, types, behavior, build output, skill resources, and the packed installation under the declared runtime support. Release tooling SHALL require successful verification before publication. Local verification SHALL not publish a package or exercise external authoring workflows.

#### Scenario: Verify a release candidate
- **GIVEN** a clean checkout using its declared runtime and locked dependencies
- **WHEN** a maintainer runs the documented verification command
- **THEN** the checks include installation of the packed package, supported conversions, direct validation, CLI-to-contract equality, and skill resource completeness
- **AND** no registry release is uploaded

#### Scenario: Detect a missing packaged skill resource
- **GIVEN** a build that omitted the canonical profile or a required local skill reference
- **WHEN** package verification runs
- **THEN** verification fails with a diagnostic identifying the missing resource before the release is eligible for publication
