# Diagnostics

Working directory: `/tmp/opsx-guidance-eval-Q63g6p/revised`.

Read the isolated skill, complete bundled canonical contract, delta examples, and task prompt. Created `draft.feature.md` before any validation or conversion; set its permissions to `0444`, then copied it to `final.feature.md`. Authoring commands exited 0.

## Command

`node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.feature.md`

Exit code: 0

Stdout:

```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.feature.md",
  "valid": true,
  "errors": []
}
```

Stderr:

```text
(empty)
```

## Command

`node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs mdg-to-opsx /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.feature.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.openspec.md`

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

`node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs opsx-to-feature /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.feature`

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

`node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format feature /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.feature`

Exit code: 0

Stdout:

```text
{
  "format": "feature",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.feature",
  "valid": true,
  "errors": []
}
```

Stderr:

```text
(empty)
```

## Command

`node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs opsx-to-mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/delta/roundtrip.feature.md`

Exit code: 0

Stdout:

```text
(empty)
```

Stderr:

```text
(empty)
```

## Preservation inspection

Command: Node fs comparison of draft, final MDG, and CLI roundtrip; SHA-256 of immutable draft.

Exit code: 0

```json
{
  "draftEqualsFinal": true,
  "finalEqualsRoundtrip": true,
  "draftMode": "444",
  "draftSha256": "c0e6a83e8f726c138934f593a9f5e896aff89b7369531ef370e4750f7d365cf0"
}
```

OpenSpec delta validation ran inside the successful conversion commands; the standalone OpenSpec validator is intended for main specifications.
