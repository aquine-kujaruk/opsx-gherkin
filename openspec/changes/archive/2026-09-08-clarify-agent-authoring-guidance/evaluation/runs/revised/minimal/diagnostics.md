# Diagnostics

Created `draft.feature.md` before validation/conversion; set mode 0444; copied it to `final.feature.md`. Creation/copy exit code: 0.

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format mdg /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.feature.md
```

Exit code: 0

stdout:
```text
{
  "format": "mdg",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.feature.md",
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs mdg-to-opsx /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.feature.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.openspec.md
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format openspec /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.openspec.md
```

Exit code: 0

stdout:
```text
{
  "format": "openspec",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.openspec.md",
  "valid": true,
  "issues": []
}
```

stderr:
```text
(empty)
```

## Command

```sh
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/cli.mjs opsx-to-feature /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.openspec.md -o /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.feature
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
node /tmp/opsx-guidance-eval-Q63g6p/revised/dist/validate-spec.mjs --format feature /tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.feature
```

Exit code: 0

stdout:
```text
{
  "format": "feature",
  "file": "/tmp/opsx-guidance-eval-Q63g6p/outputs/revised/minimal/final.feature",
  "valid": true,
  "errors": []
}
```

stderr:
```text
(empty)
```
