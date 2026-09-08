# Diagnostics

Read skill, complete canonical contract, bundled delta examples, and task prompt. Read commands exited 0.

Created draft.feature.md before any validation or conversion; set mode 0444 and copied verbatim to final.feature.md. Authoring command exited 0.

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.feature.md
```

Exit code: 0

stdout:
```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.feature.md",
  "valid": true,
  "errors": []
}
```

stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/cli.mjs mdg-to-opsx /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.feature.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.openspec.md
```

Exit code: 0

stdout:
```text
(empty)
```

stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format openspec /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.openspec.md
```

Exit code: 1

stdout:
```text
{
  "format": "openspec",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.openspec.md",
  "valid": false,
  "issues": [
    {
      "level": "ERROR",
      "path": "file",
      "message": "Spec must have a Requirements section. Missing required sections. Expected headers: \"## Purpose\" and \"## Requirements\". Example:\n## Purpose\n[brief purpose]\n\n## Requirements\n### Requirement: Clear requirement statement\nUsers SHALL ...\n\n#### Scenario: Descriptive name\n- **WHEN** ...\n- **THEN** ..."
    }
  ]
}
```

stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --help
```

Exit code: 2

stdout:
```text
(empty)
```

stderr:
```text
Usage: validate-spec [--format openspec|mdg|feature] <file>
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/cli.mjs opsx-to-feature /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.feature
```

Exit code: 0

stdout:
```text
(empty)
```

stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/original/dist/validate-spec.mjs --format feature /tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.feature
```

Exit code: 0

stdout:
```text
{
  "format": "feature",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/original/delta/final.feature",
  "valid": true,
  "errors": []
}
```

stderr:
```text
(empty)
```

## Output inspection

Python read the generated counterparts and verified draft/final MDG byte equality. Exit code: 0. No repairs. Draft SHA-256: `89ed85c4a4bf6ad13c9fdf48e132eec67165984b7937d858a87ac5b407efccc1`.
