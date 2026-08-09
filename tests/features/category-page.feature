Feature: Category page
  As a shopper
  I want to browse, search, filter, and sort medicines
  So that I can find and order what I need

  Background:
    Given I am logged in
    And I am on the category page

  # Item 1 — All medicines load
  Scenario: All published medicines load into the grid
    Then the medicine grid shows a card count matching the published medicines in the catalogue

  # Item 2 — Search filters
  Scenario: Searching for a term with no matches shows the empty state
    When I search for "zzzznonexistentzzzz"
    Then the empty state is shown
    And the medicine grid is empty

  Scenario: Searching with only whitespace behaves like no search
    When I search for "   "
    Then all published medicines are shown

  # Item 3 — Category / indication / manufacturer dropdowns
  Scenario: Category dropdown lists all distinct categories in order
    Then the category dropdown options match the sorted distinct diseaseCategory values in the catalogue

  # Item 4 — All 5 sort modes
  Scenario Outline: Sorting the grid
    When I set sort to "<sort>"
    Then the first visible card matches the expected first item for "<sort>"
    And the last loaded card matches the expected last item for "<sort>"

    Examples:
      | sort         |
      | alpha        |
      | indication   |
      | manufacturer |
      | price-asc    |
      | price-desc   |

  # Item 5 — Infinite scroll
  Scenario: Scrolling near the bottom loads the next batch
    Given more than 24 published medicines match the current filters
    When I scroll the sentinel into view
    Then 24 more cards are appended to the grid without duplicating existing cards

  # Item 6 — Medicine card carousel
  Scenario: Card carousel cycles through images with next/prev
    Given a medicine card has more than one image
    When I click the carousel next arrow
    Then the card image advances to the next image and the active dot updates

  # Item 9 — Navigate to detail
  Scenario: Clicking a card navigates to the medicine detail page with the correct id
    When I click a medicine card
    Then I am navigated to the medicine detail page for that medicine's id

  # Item 7 / cart — Add to cart
  Scenario: Adding a medicine to the cart increments the badge
    Given the cart is empty
    When I click "Add" on a medicine card
    Then the header cart badge shows "1"
    And localStorage.cart contains one entry for that medicine

  Scenario: Adding the same medicine twice increments quantity instead of duplicating
    Given the cart already contains 1 of a medicine
    When I click "Add" on that medicine's card again
    Then localStorage.cart contains one entry for that medicine with qty 2

  # Send Query modal
  Scenario: Submitting a query without a name shows a validation error
    Given I open the query modal for a medicine
    When I submit the query form with no name
    Then a validation error is shown
    And the success state is not shown

  Scenario: Submitting a query with a name and phone succeeds
    Given I open the query modal for a medicine
    When I fill in a name and phone number and submit
    Then the success state is shown

  # Items 21-23 — Responsive layout
  Scenario Outline: Grid column count adapts per breakpoint
    Given the viewport is <width>px wide
    Then the medicine grid shows <columns> column(s)

    Examples:
      | width | columns |
      | 375   | 1       |
      | 768   | 2       |
      | 1280  | 3       |

  Scenario: No horizontal scroll at mobile width
    Given the viewport is 375px wide
    Then the page has no horizontal overflow

  # Item 24 — Responsive text & buttons (see CHANGE.md checklist item 24 note:
  # legacy card buttons render ~28px on mobile, not the 44px target — known
  # Phase 1 exception, kept pixel-identical to Legacy pages/category.html)
  Scenario: Add-to-cart button meets the legacy mobile height
    Given the viewport is 375px wide
    Then every card's "Add" button has a rendered height of at least 28px
