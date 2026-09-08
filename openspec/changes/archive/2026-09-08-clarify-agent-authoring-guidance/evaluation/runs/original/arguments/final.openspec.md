# Library catalog copy imports

## Purpose

Import copies into the library catalog with a clear decision for each requested copies count.

## Requirements

### Requirement: Imports require a positive copies count

The system SHALL accept imports with a positive copies count and SHALL reject imports with zero copies.

#### Scenario Outline: Decide whether to import catalog copies

- **GIVEN** the catalog import has these fields:
  | field | value |
  | --- | --- |
  | shelf | A\|B |
  | source | C:\\catalog |
- **WHEN** the following JSON import is submitted:

  ```json
  {
    "copies": <copies>,
    "shelf": "A|B",
    "source": "C:\\catalog"
  }
  ```
- **THEN** the import decision is <decision>

##### Examples: Accepted

  | copies | decision |
  | --- | --- |
  | 1 | accepted |
  | 2 | accepted |

##### Examples: Rejected

  | copies | decision |
  | --- | --- |
  | 0 | rejected |
