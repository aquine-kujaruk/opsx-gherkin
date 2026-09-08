`@openspec-delta`
# Library circulation delta

## Purpose

Update loan renewal, book reservation, and circulation audit requirements.

## ADDED Requirements

### Requirement: Renew a loan

The circulation service SHALL allow an active member to renew a loan once.

#### Scenario: Renew a loan with zero previous renewals

- **GIVEN** member M-17 is active
- **AND** loan L-8 belongs to member M-17 and has 0 previous renewals
- **WHEN** member M-17 renews loan L-8
- **THEN** loan L-8 is renewed
- **AND** the renewal count for loan L-8 is 1

## MODIFIED Requirements

### Requirement: Reserve an available book

The circulation service SHALL allow an active member with fewer than 3 current reservations to reserve an available book.

#### Scenario: Reserve an available book with two current reservations

- **GIVEN** member M-17 is active
- **AND** member M-17 has 2 current reservations
- **AND** book B-42 is available
- **WHEN** member M-17 reserves book B-42
- **THEN** the reservation of book B-42 for member M-17 is confirmed
- **AND** member M-17 has 3 current reservations

## REMOVED Requirements

### Requirement: Fax reservation

## RENAMED Requirements

- FROM: `### Requirement: Loan audit`
- TO: `### Requirement: Circulation audit`
