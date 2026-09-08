# Library reservations

## Purpose

Allow active library members to reserve available books and receive confirmation identifying the member and book.

## Requirements

### Requirement: Active members can reserve available books

The library reservation service SHALL confirm a reservation when an active member reserves an available book.

#### Scenario: An active member reserves an available book

- **GIVEN** member M-17 is active
- **AND** book B-42 is available
- **WHEN** member M-17 reserves book B-42
- **THEN** the reservation is confirmed for member M-17 and book B-42
