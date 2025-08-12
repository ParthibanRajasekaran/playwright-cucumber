@login @smoke @regression
Feature: User Authentication
  As a user
  I want to authenticate securely with the application
  So that I can access my account and protected features

  Background:
    Given the login page is available

  @positive @critical
  Scenario: Successful authentication with valid credentials
    Given I have valid user credentials
    When I authenticate with the application
    Then I should be granted access to my account
    And I should see my personalized dashboard
    And my login session should be established

  @positive @session
  Scenario: Persistent login session
    Given I have valid user credentials
    When I authenticate with "remember me" enabled
    Then I should be granted access to my account
    And my login session should persist across browser sessions

  @negative @security
  Scenario Outline: Authentication rejection with invalid credentials
    Given I have "<credential_type>" credentials
    When I attempt to authenticate
    Then my authentication should be rejected
    And I should see an appropriate error message
    And I should remain unauthenticated

    Examples:
      | credential_type     |
      | incorrect username  |
      | incorrect password  |
      | empty username      |
      | empty password      |
      | both empty          |

  @negative @security
  Scenario: Account protection against brute force attacks
    Given I have made multiple failed authentication attempts
    When I exceed the allowed failure threshold
    Then my account should be temporarily locked
    And further authentication attempts should be blocked
    And I should receive appropriate security notifications

  @accessibility @compliance
  Scenario: Authentication interface accessibility
    Given the login interface is displayed
    Then the authentication form should be fully accessible
    And all interactive elements should have proper labels
    And keyboard navigation should be fully functional
    And screen reader compatibility should be maintained

  @responsive @ui
  Scenario: Authentication interface adaptability
    Given I am using a mobile device
    When I access the login interface
    Then the interface should adapt to my screen size
    And all functionality should remain accessible

  @navigation @user-flow
  Scenario: Password recovery workflow
    Given I have forgotten my password
    When I request password recovery
    Then I should be guided through the reset process
    And I should receive appropriate recovery instructions

  @navigation @user-flow
  Scenario: New user registration flow
    Given I am a new user without an account
    When I choose to create an account
    Then I should be guided to the registration process
    And I should be able to complete my account setup

  @performance @reliability
  Scenario: Authentication system performance
    Given the authentication system is under normal load
    When I submit my credentials
    Then authentication should complete promptly
    And system response time should meet performance standards

  @security @edge-case
  Scenario: Authentication with special character passwords
    Given I have a password containing special characters
    When I authenticate with these credentials
    Then the system should handle the authentication correctly
    And character encoding should not affect the process

  @session @security
  Scenario: Secure session termination
    Given I am authenticated and using the application
    When I choose to logout
    Then my session should be completely terminated
    And I should be returned to the unauthenticated state
    And my session data should be properly cleared
