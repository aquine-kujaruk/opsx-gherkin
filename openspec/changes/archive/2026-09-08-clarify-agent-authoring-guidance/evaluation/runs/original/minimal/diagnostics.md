# Diagnostics

Draft authored and made read-only before all validation/conversion; copied to final.feature.md. Creation command exit code: 0; no diagnostics.

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/draft.feature.md
```

Exit code: 0

Stdout:
```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/draft.feature.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.feature.md
```

Exit code: 0

Stdout:
```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.feature.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/cli.mjs mdg-to-opsx /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.feature.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.openspec.md
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
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format openspec /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.openspec.md
```

Exit code: 0

Stdout:
```text
{
  "format": "openspec",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.openspec.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/cli.mjs opsx-to-feature /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.feature
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
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format feature /tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.feature
```

Exit code: 0

Stdout:
```text
{
  "format": "feature",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/minimal/final.feature",
  "valid": true,
  "errors": []
}
```

Stderr:
```text
(empty)
```

## Final inspection

Python byte comparison of draft.feature.md and final.feature.md: identical; exit code 0. Generated OpenSpec and Gherkin inspected: one Requirement/Rule, one Scenario, all requested identifiers and behavior preserved. No diagnostics.
