# Library book reservations

## Purpose

Enable active library members to reserve available books and receive confirmation identifying the member and book.

## Requirements

### Requirement: Active members can reserve available books

The reservation service SHALL confirm a reservation for an active member and an available book when that member reserves the book.

#### Scenario: Active member reserves an available book

- **GIVEN** member M-17 is active
- **AND** book B-42 is available
- **WHEN** M-17 reserves B-42
- **THEN** the reservation is confirmed for M-17 and B-42
