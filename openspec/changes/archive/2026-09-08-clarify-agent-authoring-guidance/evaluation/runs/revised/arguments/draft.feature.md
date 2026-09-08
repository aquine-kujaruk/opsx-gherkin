# Feature: Import library catalog copies

Import library catalog copies with a positive copies count and reject imports with zero copies.

## Rule: Decide imports by copies count

The system SHALL accept an import with a positive copies count and SHALL reject an import with zero copies.

### Scenario Outline: Import catalog copies

* Given the import has the following catalog fields:

  | field | value |
  | --- | --- |
  | shelf | A\|B |
  | source | C:\\catalog |
* When the following JSON import is submitted:

  ```json
  {
    "copies": <copies>,
    "shelf": "A|B",
    "source": "C:\\catalog"
  }
  ```
* Then the import decision is <decision>

#### Examples: Accepted

  | copies | decision |
  | --- | --- |
  | 1 | accepted |
  | 2 | accepted |

#### Examples: Rejected

  | copies | decision |
  | --- | --- |
  | 0 | rejected |
