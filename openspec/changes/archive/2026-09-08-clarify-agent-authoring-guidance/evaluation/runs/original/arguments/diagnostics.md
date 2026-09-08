# Diagnostics

- Read permitted SKILL.md and arguments-prompt.txt with `cat`; exit code 0; no diagnostics.
- Read complete canonical profile and account MDG/OpenSpec/Gherkin examples with `cat`; exit code 0; no diagnostics.
- Created draft.feature.md with apply_patch, then set mode 0444 and copied to final.feature.md before any validation or conversion; successful; no diagnostics.

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature.md
```

Exit code: 0

Stdout:
```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature.md",
  "valid": true,
  "errors": []
}
```

Stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/cli.mjs mdg-to-opsx /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.openspec.md
```

Exit code: 0

Stdout:
```text
(empty)
```

Stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format openspec /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.openspec.md
```

Exit code: 0

Stdout:
```text
{
  "format": "openspec",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.openspec.md",
  "valid": true,
  "issues": []
}
```

Stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/cli.mjs opsx-to-feature /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature
```

Exit code: 0

Stdout:
```text
(empty)
```

Stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format feature /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature
```

Exit code: 0

Stdout:
```text
{
  "format": "feature",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature",
  "valid": true,
  "errors": []
}
```

Stderr:
```text
(empty)
```

## Output inspection

```sh
cat /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.openspec.md /tmp/opsx-guidance-eval-Q63g6p/outputs/original/arguments/final.feature
```

Exit code: 0. No stderr. Inspected the complete generated documents.

Findings: one Rule/Requirement and one Scenario Outline; Accepted has exactly two data rows (1/accepted, 2/accepted), Rejected exactly one (0/rejected). Native Gherkin has no Markdown separator rows. Data Table escaping preserves shelf A|B and source C:\catalog with one literal backslash. JSON uses an unquoted numeric <copies> placeholder, literal pipe, and a doubled JSON backslash decoding to one. The Doc String remains typed json. No content repairs required. Byte comparison confirms final.feature.md equals immutable draft.feature.md.
