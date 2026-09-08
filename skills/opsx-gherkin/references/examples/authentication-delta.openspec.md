`@code`
`@openspec-delta`
# Authentication delta

## Purpose

STRUCTURAL CHANGE DOCUMENT: This Feature packages OpenSpec delta operations for authentication software. It demonstrates a change document, not one completed application use case. The added and modified requirements contain complete behavioral examples; removal and rename contain only the names allowed by the conversion contract.

## ADDED Requirements

### Requirement: Recovery codes

The system SHALL accept one unused recovery code.

#### Scenario Outline: An unused recovery code grants account access

- **GIVEN** the account with email "<accountEmail>" has the unused recovery code "<storedRecoveryCode>"
- **WHEN** a user requests account access for "<submittedEmail>" with recovery code "<submittedRecoveryCode>"
- **THEN** access is granted to the account with email "<expectedAccountEmail>"

##### Examples: Matching unused recovery code

  | accountEmail | storedRecoveryCode | submittedEmail | submittedRecoveryCode | expectedAccountEmail |
  | --- | --- | --- | --- | --- |
  | user@example.com | recovery-7 | user@example.com | recovery-7 | user@example.com |

## MODIFIED Requirements

### Requirement: Password sign-in

The system SHALL reject an incorrect password.

#### Scenario Outline: An incorrect password rejects account access

- **GIVEN** the account with email "<accountEmail>" has the password "<storedPassword>"
- **WHEN** a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
- **THEN** access is rejected

##### Examples: Password mismatch

  | accountEmail | storedPassword | submittedEmail | submittedPassword |
  | --- | --- | --- | --- |
  | user@example.com | correct-password | user@example.com | wrong-password |

## REMOVED Requirements

### Requirement: Security questions

## RENAMED Requirements

- FROM: `### Requirement: Login audit`
- TO: `### Requirement: Authentication audit`
