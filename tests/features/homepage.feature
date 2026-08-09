Feature: Homepage
  As a visitor
  I want to land on the MediFy homepage and act on its key calls to action
  So that I can search, browse products, and request a call to order

  # Item 18 — Auth guard
  Scenario: Visiting the homepage unauthenticated redirects to login
    Given I am not logged in
    When I visit the homepage
    Then I am redirected to the login page

  Scenario: Visiting the homepage while authenticated does not redirect
    Given I am logged in
    When I visit the homepage
    Then I remain on the homepage

  # Hero search — redirects to the category page with the query
  Scenario: Searching from the homepage hero navigates to the category page with the query
    Given I am logged in
    And I am on the homepage
    When I search from the homepage for "paracetamol"
    Then I am navigated to the category page with search query "paracetamol"

  Scenario: Submitting the homepage search with an empty query does not navigate away
    Given I am logged in
    And I am on the homepage
    When I search from the homepage for ""
    Then the page has not navigated away from the homepage

  # Request a Call to Order — shares the CallModal organism with medicine-detail
  Scenario: Requesting a call to order with a valid phone number succeeds
    Given I am logged in
    And I am on the homepage
    When I open the call modal
    And I enter a valid phone number and submit the call request
    Then the call success state is shown

  Scenario: Requesting a call to order with an invalid phone number shows a validation error
    Given I am logged in
    And I am on the homepage
    When I open the call modal
    And I enter an invalid phone number and submit the call request
    Then a call phone validation error is shown

  # Primary nav links — anchor navigation within the page
  Scenario: Clicking a primary nav link scrolls to the matching section
    Given I am logged in
    And I am on the homepage
    When I click the "Services" nav link
    Then the URL hash becomes "#services"

  # Item 21/22/23 — responsive layout
  Scenario Outline: Homepage product category grid shows the expected column count per breakpoint
    Given I am logged in
    And the viewport is <width>px wide
    When I visit the homepage
    Then the homepage product category grid shows <columns> column(s)

    Examples:
      | width | columns |
      | 375   | 2       |
      | 768   | 3       |
      | 1280  | 5       |

  Scenario: Mobile nav hamburger toggles the menu open and closed
    Given I am logged in
    And the viewport is 375px wide
    When I visit the homepage
    Then the mobile nav menu is closed
    When I click the mobile nav toggle
    Then the mobile nav menu is open

  # Known Phase 1 exception (see CHANGE.md): the stats-strip grid items don't
  # shrink below their content's min-width at 375px, causing ~4px of horizontal
  # overflow. This is present in Legacy pages/index.html itself, not introduced
  # by the port, so it is kept pixel-identical rather than "fixed" here.
  Scenario: Homepage horizontal overflow at mobile width does not exceed the known legacy amount
    Given I am logged in
    And the viewport is 375px wide
    When I visit the homepage
    Then the page has no more than 5px of horizontal overflow

  Scenario: No console errors occur while loading the homepage
    Given I am logged in
    When I visit the homepage
    Then no error is thrown to the console
