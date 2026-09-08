# Compatibility contract

- Before changing specifications, conversion behavior, or syntax guidance, read `skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md` completely.
- Keep that file as the only canonical mapping contract. Update its relevant Rule/Scenario before changing compatibility behavior.
- Use the official endpoint validators and verify preservation of the documented model.
- Keep the CLI and skill independent of other skills, generators, and agent workflows.
- Run `pnpm verify` before considering changes ready.
