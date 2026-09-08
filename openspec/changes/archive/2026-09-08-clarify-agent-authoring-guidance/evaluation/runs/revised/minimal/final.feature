Feature: Library book reservations

  Enable active library members to reserve available books and receive confirmation identifying the member and book.

  Rule: Active members can reserve available books

    The reservation service SHALL confirm a reservation for an active member and an available book when that member reserves the book.

    Scenario: Active member reserves an available book
      Given member M-17 is active
      And book B-42 is available
      When M-17 reserves B-42
      Then the reservation is confirmed for M-17 and B-42
