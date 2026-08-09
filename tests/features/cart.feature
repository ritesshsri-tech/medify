Feature: Cart
  As a shopper
  I want to add medicines to my cart and manage quantities
  So that I can review and order what I've selected

  Background:
    Given I am logged in

  # Item 7 — Add to cart
  Scenario: Adding a new medicine creates a cart entry with qty 1
    Given the cart is empty
    When I add a medicine to the cart
    Then localStorage.cart contains one entry for that medicine with qty 1
    And the header cart badge shows "1"

  Scenario: Adding an already-cart medicine increments its quantity
    Given the cart already contains 1 of a medicine
    When I add that same medicine to the cart again
    Then localStorage.cart contains one entry for that medicine with qty 2
    And no duplicate entry is created

  Scenario: Cart badge is hidden when the cart is empty
    Given the cart is empty
    Then the header cart badge is not shown

  Scenario: Removing a medicine from the cart updates the badge count
    Given I am on the category page
    And the cart contains 2 distinct medicines
    When I remove one medicine from the cart
    Then localStorage.cart contains only the remaining medicine
    And the header cart badge reflects the remaining quantity

  Scenario: Cart persists across a page reload
    Given I am on the category page
    And the cart contains 1 medicine with qty 3
    When I reload the page
    Then localStorage.cart still contains that medicine with qty 3

  # Item 11 (qty sync between desktop and mobile cart bar, and decrease-clamped-
  # to-1) requires pages/medicine-detail.html, which does not exist yet
  # (Step 7 of the migration roadmap). Deferred until that page is built.
