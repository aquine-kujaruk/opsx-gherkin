# Diagnostics

Working directory: `/tmp/opsx-guidance-eval-Q63g6p/revised`.

Preparatory reads (both exit 0; no diagnostics):

```sh
cat skills/opsx-gherkin/SKILL.md /tmp/opsx-guidance-eval-Q63g6p/arguments-prompt.txt
cat skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md skills/opsx-gherkin/references/examples/account.feature.md skills/opsx-gherkin/references/examples/account.openspec.md skills/opsx-gherkin/references/examples/account.feature
```

Authored `draft.feature.md`, set mode 444, then copied it to writable `final.feature.md`, all before validation or conversion. No other input files were read.

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/draft.feature.md
```

Exit code: 0

Stdout:

```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/draft.feature.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs mdg-to-opsx /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.feature.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.openspec.md
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs opsx-to-feature /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.feature
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.feature.md
```

Exit code: 0

Stdout:

```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.feature.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format openspec /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.openspec.md
```

Exit code: 0

Stdout:

```text
{
  "format": "openspec",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.openspec.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format feature /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.feature
```

Exit code: 0

Stdout:

```text
{
  "format": "feature",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/arguments/final.feature",
  "valid": true,
  "errors": []
}
```

Stderr:

```text
(empty)
```

## Content verification

Command: inline `python3` review of generated outputs (no project code or other inputs read).

Content review exit code: 0. One Rule, one Scenario Outline, Accepted rows 1/2 and Rejected row 0 preserved; JSON parses for all three numeric substitutions with shelf A|B and one decoded source backslash. Native table preserves escaped pipe/backslash. Draft and final MDG bytes identical. Draft SHA-256: fc4890534e6060409a1744f9f7374ce26bfa8a2b8f8a8cedc107f34789268549.

Diagnostics: none.
