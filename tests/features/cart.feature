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

  # Item 11 — Qty change syncs between desktop and mobile cart bar
  # (desktop and mobile cart bars are never both visible at once — only one
  # shows per breakpoint — so "syncs" means the underlying qty state carries
  # over correctly when the viewport switches between them)
  Scenario: Quantity increased on desktop is reflected after switching to mobile viewport
    Given I open the detail page for a known medicine at desktop width
    When I increase the quantity via the desktop control
    And I switch to mobile width
    Then the mobile quantity display shows 2

  Scenario: Quantity increased on mobile is reflected after switching to desktop viewport
    Given I open the detail page for a known medicine at mobile width
    When I increase the quantity via the mobile control
    And I switch to desktop width
    Then the desktop quantity display shows 2

  Scenario: Decreasing quantity below 1 is clamped to 1
    Given I open the detail page for a known medicine at desktop width
    When I decrease the quantity via the desktop control
    Then the desktop quantity display shows 1
