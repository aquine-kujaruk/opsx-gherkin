`@code`
# Add a product to an empty shopping cart

## Purpose

Keep the quantity a customer selects when adding a product to an empty shopping cart.

## Requirements

### Requirement: Adding a product retains its quantity

The cart SHALL contain the selected quantity of a product after the customer adds it.

#### Scenario Outline: Retain the requested product quantity

- **GIVEN** an empty shopping cart
- **WHEN** the customer adds <requestedQuantity> units of product "<productId>"
- **THEN** the cart contains <expectedQuantity> units of product "<productId>"

##### Examples: Selected quantity

  | productId | requestedQuantity | expectedQuantity |
  | --- | --- | --- |
  | P-7 | 2 | 2 |
