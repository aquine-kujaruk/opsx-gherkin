## Why

The conversion prototype lives in a temporary workspace and its compatibility contract is a root-level document rather than a distributable skill. It needs a maintained home and a publishable CLI with self-contained syntax guidance that describes the same behavior the converters enforce.

## What Changes

- Migrate the existing tool into this project, retaining its supported conversion directions, command names, input/output behavior, and documented compatibility profile.
- Separate parsing, the shared document model, compatibility rules, rendering, official validation, and CLI I/O into typed modules with focused tests.
- Create an independent `opsx-gherkin` skill explaining compatible syntax, format correspondences, constraints, examples, and command usage.
- Relocate `OPENSPEC_MDG_PROFILE.feature.md` to the skill's references as the single canonical mapping contract. The existing `profile` command and its `instructions` alias will read that same packaged resource.
- Prepare reproducible builds, package verification, contribution documentation, CI, and release tooling for public distribution of the CLI and complete skill bundle.
- Limit verification to the CLI, the skill, their shared contract, and the distributed package. Workflow integrations, custom OpenSpec schemas, proposal/apply exercises, and downstream test generation are outside this change.

## Capabilities

### New Capabilities

- `format-conversion`: Deterministic conversion and endpoint validation within the documented compatibility profile, preserving the existing CLI interface.
- `compatibility-guidance`: An independently usable skill that explains syntax and compatibility practices and owns the canonical contract exposed by the CLI.
- `package-distribution`: A reproducible, self-contained distribution containing executable commands and the complete skill, verified from an installed package.

### Modified Capabilities

None. This project has no existing main specifications; conversion behavior is being adopted from the prototype.

## Impact

- Introduces the application source, tests, maintained examples, skill resources, build configuration, package metadata, and contributor/release tooling in this project.
- Preserves the prototype directory as a migration reference; local dependencies, scratch files, and generated session outputs are not copied as repository content.
- The root-level contract path moves into the skill. CLI consumers continue to retrieve it through the existing commands.
- Retains official OpenSpec and Cucumber validation as runtime dependencies. No other skill, agent workflow, or generator becomes a product dependency.
- Prepares publication without uploading a release, provisioning remote services, or installing the skill into personal agent settings.
