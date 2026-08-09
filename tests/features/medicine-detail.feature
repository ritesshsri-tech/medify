Feature: Medicine detail page
  As a shopper
  I want to see full details of a medicine and take action on it
  So that I can decide whether and how to order it

  Background:
    Given I am logged in

  # Item 10 — Medicine detail loads
  Scenario: Detail page loads brand, salt, price, and images matching source data
    Given I open the detail page for a known medicine
    Then the brand name, salt name, price, and manufacturer match the source data

  Scenario: Detail page shows an error state for an unknown id
    When I open the detail page with an id that does not exist
    Then the error state is shown

  Scenario: Detail page shows an error state when no id is provided
    When I open the detail page with no id
    Then the error state is shown

  # Item 12 — Salt modal
  Scenario: Salt modal lists other manufacturers of the same salt
    Given I open the detail page for a medicine that has same-salt alternatives
    When I open the salt modal
    Then the salt modal lists medicines with the same salt name
    And the salt modal title mentions the salt name

  Scenario: Salt modal falls back to related medicines when no same-salt alternative exists
    Given I open the detail page for a medicine with no same-salt alternatives
    When I open the salt modal
    Then the salt modal shows the "exact salt not found" fallback message

  Scenario: Salt modal search filters the list
    Given I open the detail page for a medicine that has same-salt alternatives
    And I open the salt modal
    When I search the salt modal for a term with no matches
    Then the salt modal shows a "no results" message

  # Item 13 — Manufacturer modal
  Scenario: Manufacturer modal lists other medicines from the same manufacturer
    Given I open the detail page for a medicine that has same-manufacturer alternatives
    When I open the manufacturer modal
    Then the manufacturer modal lists medicines from the same manufacturer

  # Item 14 — Query form
  Scenario: Send Query pre-fills the medicine name and submits without a page reload
    Given I open the detail page for a known medicine
    When I open the query modal via Send Query
    And I fill in a name and phone number and submit
    Then the success state is shown
    And the page has not navigated away

  # Item 15 — Call modal
  Scenario: Get a Call to Order submits successfully with a valid phone number
    Given I open the detail page for a known medicine
    When I open the call modal
    And I enter a valid phone number and submit the call request
    Then the call success state is shown

  Scenario: Get a Call to Order rejects an invalid phone number
    Given I open the detail page for a known medicine
    When I open the call modal
    And I enter an invalid phone number and submit the call request
    Then a call phone validation error is shown

  # Item 16 — FAQ accordion
  Scenario: Opening one FAQ closes any other open FAQ
    Given I open the detail page for a known medicine
    When I open the first FAQ
    And I open the second FAQ
    Then only the second FAQ is open

  # Item 17 — Scroll spy
  Scenario: Scrolling updates the active quick-link section
    Given I open the detail page for a known medicine
    When I scroll to the "usage" section
    Then the "usage" quick link becomes active

  # Cart badge sync (item 11, testable half — see cart.feature for the rest)
  Scenario: Adding to cart from the detail page increments the header badge
    Given the cart is empty
    And I open the detail page for a known medicine
    When I add the medicine to cart from the detail page
    Then the header cart badge shows "1"
