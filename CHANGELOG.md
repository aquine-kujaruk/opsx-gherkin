## [2.0.1](https://github.com/aquine-kujaruk/opsx-gherkin/compare/v2.0.0...v2.0.1) (2026-10-21)


### Bug Fixes

* **skill:** state that inline step comments are preserved step text ([7e49eae](https://github.com/aquine-kujaruk/opsx-gherkin/commit/7e49eae1fe3beb7049f7817ce84309e216ea1745))

# [2.0.0](https://github.com/aquine-kujaruk/opsx-gherkin/compare/v1.0.1...v2.0.0) (2026-10-20)


### Features

* **mdg:** emit table separator rows in canonical output ([af14b3d](https://github.com/aquine-kujaruk/opsx-gherkin/commit/af14b3d910138da7851c425aad97dcc9b1895d74))
* **skill:** stop teaching verification modalities ([eeaa51a](https://github.com/aquine-kujaruk/opsx-gherkin/commit/eeaa51ad7a3ea86cbf61e5ed8638e06fedaf76d5))


### BREAKING CHANGES

* **mdg:** canonical MDG from opsx-to-mdg now contains a `| --- |` row after every table
header, so converted .feature.md files with tables change bytes. The interpreted model is
unchanged and input accepts both forms; no document needs migration. The bundled
references/examples/account.* files are removed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

## [1.0.1](https://github.com/aquine-kujaruk/opsx-gherkin/compare/v1.0.0...v1.0.1) (2026-09-08)


### Bug Fixes

* publish releases from main ([c1a7fd3](https://github.com/aquine-kujaruk/opsx-gherkin/commit/c1a7fd305bb6af290a3d9bcc22e1175b60577d24))
* repair automated release generation ([17bbae0](https://github.com/aquine-kujaruk/opsx-gherkin/commit/17bbae04ed68b172bc593ccdc19960e4f2a02870))

# Changelog

## Unreleased

- Migrate the conversion CLI into a typed, tested, reproducible package.
- Include an independent syntax compatibility skill owning the canonical profile.
- Check normalized model preservation before emitting converted documents.
- Preserve delta operation-group order and reject unmapped removal/rename content.
