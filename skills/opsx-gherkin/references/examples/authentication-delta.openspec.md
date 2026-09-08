`@openspec-delta`
# Authentication delta

## Purpose

Update authentication behavior.

## ADDED Requirements

### Requirement: Recovery codes

The system SHALL accept one unused recovery code.

#### Scenario: Use a recovery code

- **WHEN** an unused recovery code is submitted
- **THEN** access is granted

## MODIFIED Requirements

### Requirement: Password sign-in

The system SHALL reject an incorrect password.

#### Scenario: Reject an incorrect password

- **WHEN** an incorrect password is submitted
- **THEN** access is rejected

## REMOVED Requirements

### Requirement: Security questions

## RENAMED Requirements

- FROM: `### Requirement: Login audit`
- TO: `### Requirement: Authentication audit`
