Feature: Authentication
  As a visitor
  I want to log in with a PIN and be signed out when appropriate
  So that only authenticated users can access the catalogue

  # Item 18 — Auth guard
  Scenario: Visiting category page unauthenticated redirects to login
    Given I am not logged in
    When I visit the category page
    Then I am redirected to the login page

  Scenario: Visiting medicine-detail page unauthenticated redirects to login
    Given I am not logged in
    When I visit a medicine detail page
    Then I am redirected to the login page

  Scenario: Visiting category page while authenticated does not redirect
    Given I am logged in
    When I visit the category page
    Then I remain on the category page

  # Item 19 — Login PIN.
  # The PIN is an access boundary only: it unlocks visibility of the site and
  # deliberately does NOT sign anyone in, so currentUser stays unset.
  Scenario Outline: A valid PIN unlocks the site and lands on the intended page
    Given I am not logged in
    And I was redirected to login from the category page
    When I enter the PIN "<pin>"
    Then I am redirected back to the category page
    And the site is unlocked in localStorage
    And currentUser is not set in localStorage

    Examples:
      | pin  |
      | 0000 |
      | 4321 |

  Scenario: An invalid PIN shows an error and does not unlock the site
    Given I am on the login page
    When I enter the PIN "9999"
    Then a "Incorrect PIN" error is shown
    And the site is not unlocked in localStorage
    And currentUser is not set in localStorage

  Scenario: Logging in with no prior redirect lands on the homepage
    Given I am on the login page directly
    When I enter the PIN "0000"
    Then I am redirected to the homepage

  # Item 20 — Sign out
  Scenario: Signing out clears currentUser and redirects to login
    Given I am logged in
    And I am on the category page
    When I sign out from the header menu
    Then I am redirected to the login page
    And currentUser is not set in localStorage
