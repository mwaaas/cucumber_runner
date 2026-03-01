Feature: Calculator
  As a user
  I want to use a calculator
  So that I can do basic math operations

  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120 on the screen

  Scenario: Subtract two numbers
    Given I have entered 100 into the calculator
    And I have entered 30 into the calculator
    When I press subtract
    Then the result should be 70 on the screen

  Scenario Outline: Multiple additions
    Given I have entered <first> into the calculator
    And I have entered <second> into the calculator
    When I press add
    Then the result should be <result> on the screen

    Examples:
      | first | second | result |
      | 1     | 2      | 3      |
      | 10    | 20     | 30     |
      | 5     | 5      | 10     |