# Authoring exercise

Three fixed cases, one original-bundle and one revised-bundle run each. Prompts, facts, rubric and baseline hashes recorded in plan.json before guidance edits. This is a qualitative comparison, not a statistical benchmark.

Each evaluator receives only its task prompt, skill snapshot, executable CLI and output directory. It reads the full contract, writes an immutable first draft before validation, then validates/converts and records repairs separately. No repository source, planning documents, conversation or other run outputs are supplied.

Same inherited configuration, fresh context per run. Exact model build, temperature, seed and timing/token accounting unavailable; no values inferred. Filesystem isolation relies on instructions.

Only the accepted six-run exercise is performed. Larger benchmarks, trigger tuning and review servers from the general skill-creator workflow are outside this change. Endpoint/model checks are reported separately from transfer of the supplied domain behavior.

## Reproduction

Restore the original skill from the revision in `plan.json`; compare its files against the recorded SHA-256 hashes. Use the implemented skill for the revised phase and compare `revised-bundle.json`. Copy each bundle into a separate temporary package directory with the same built CLI, package.json and existing dependency installation. Evaluation snapshots are temporary inputs, not additional normative contracts in the distribution.

For each phase and case, start a fresh subagent with `fork_turns: "none"`, omitting model and reasoning overrides. Supply this task wrapper, substituting its paths, and the corresponding prompt verbatim from `plan.json`:

```text
Execute an isolated authoring exercise. Read and use only <bundle>/SKILL.md and
its bundled references, the task at <prompt-file>, and CLI commands via
node <package>/dist/cli.mjs (validator: node <package>/dist/validate-spec.mjs).
Workdir <package>. Do not read project files, other skills, other runs, planning
artifacts or conversation. Do not delegate. You own only <output-directory>;
other agents work alongside you, do not edit their files. Create immutable
draft.feature.md BEFORE any validation/conversion. Then copy to final.feature.md
and validate/convert as needed to deliver final.openspec.md and final.feature.
Keep command, exit-code and diagnostic logs in diagnostics.md; record any repairs
from draft to final in notes.md (or explicitly none). Use CLI generated
counterparts, preserve first draft. Report outputs and validation findings concisely.
```

The six agent task names were `original_minimal`, `original_arguments`, `original_delta`, `revised_minimal`, `revised_arguments`, and `revised_delta`, under the same parent task. Completed outputs are retained under `runs/<phase>/<case>/`. Do not compare latency or token usage: the tool did not provide those metrics.

From the repository root, after building the CLI, run:

```sh
node openspec/changes/archive/2026-09-08-clarify-agent-authoring-guidance/evaluation/check.mjs
```

This writes `checks.json` for both first drafts and final outputs, independently of the agents' diagnostic logs. Main OpenSpec documents use the standalone official validator. Deltas use the official strict `Validator.validateChangeDeltaSpecs` endpoint, also invoked internally by the converters. Review the recorded domain content against every prompt/rubric in addition to the executable assertions.
