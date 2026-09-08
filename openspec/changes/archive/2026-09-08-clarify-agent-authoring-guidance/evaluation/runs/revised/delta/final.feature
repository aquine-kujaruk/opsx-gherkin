@openspec-delta
Feature: Library circulation delta

  Update loan renewal, book reservation, and circulation audit requirements.

  @openspec-added
  Rule: Renew a loan

    The circulation service SHALL allow an active member to renew a loan once.

    Scenario: Renew a loan with zero previous renewals
      Given member M-17 is active
      And loan L-8 belongs to member M-17 and has 0 previous renewals
      When member M-17 renews loan L-8
      Then loan L-8 is renewed
      And the renewal count for loan L-8 is 1

  @openspec-modified
  Rule: Reserve an available book

    The circulation service SHALL allow an active member with fewer than 3 current reservations to reserve an available book.

    Scenario: Reserve an available book with two current reservations
      Given member M-17 is active
      And member M-17 has 2 current reservations
      And book B-42 is available
      When member M-17 reserves book B-42
      Then the reservation of book B-42 for member M-17 is confirmed
      And member M-17 has 3 current reservations

  @openspec-removed
  Rule: Fax reservation

  @openspec-renamed
  Rule: Rename requirement

    FROM: ### Requirement: Loan audit
    TO: ### Requirement: Circulation audit
