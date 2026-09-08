Feature: Library reservations

  Allow active library members to reserve available books and receive confirmation identifying the member and book.

  Rule: Active members can reserve available books

    The library reservation service SHALL confirm a reservation when an active member reserves an available book.

    Scenario: An active member reserves an available book
      Given member M-17 is active
      And book B-42 is available
      When member M-17 reserves book B-42
      Then the reservation is confirmed for member M-17 and book B-42
