@code
Feature: Add a product to an empty shopping cart

  Keep the quantity a customer selects when adding a product to an empty shopping cart.

  Rule: Adding a product retains its quantity

    The cart SHALL contain the selected quantity of a product after the customer adds it.

    Scenario Outline: Retain the requested product quantity
      Given an empty shopping cart
      When the customer adds <requestedQuantity> units of product "<productId>"
      Then the cart contains <expectedQuantity> units of product "<productId>"

      Examples: Selected quantity
        | productId | requestedQuantity | expectedQuantity |
        | P-7 | 2 | 2 |
