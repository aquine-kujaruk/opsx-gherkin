@authentication @security
Feature: User sign-in

  Allow registered users to access their accounts securely while rejecting invalid credentials and limiting repeated attempts.

  Background:
    Given the authentication service is available
    And the following registered account exists:
      | email | password | status |
      | user@example.com | correct-password | active |

  @credentials
  Rule: Credentials are verified securely

    The system SHALL grant access only when an active registered user provides the correct email address and password.

    @smoke @positive
    Scenario: Sign-in succeeds with correct credentials
      Given the registered account from the background
      When the user signs in with email `user@example.com` and password `correct-password`
      Then the system grants access to the account
      And the system starts an authenticated session

    @negative @api
    Scenario Outline: Sign-in rejects invalid credentials
      Given the registered account from the background
      When a user signs in with email `<email>` and password `<password>`
      Then the system rejects access with status `<status>`
      And the response body is:
        """json
        {
          "error": "<error>"
        }
        """

      @unknown-account
      Examples: Unknown account
        | email | password | status | error |
        | missing@example.com | any-password | 401 | invalid_credentials |

      @incorrect-password
      Examples: Incorrect password
        | email | password | status | error |
        | user@example.com | wrong-password | 401 | invalid_credentials |

  @account-protection
  Rule: Repeated failures lock the account

    The system SHALL lock an account after five consecutive failed sign-in attempts.

    @negative @lockout
    Scenario: The fifth failed attempt locks the account
      Given the registered account has four consecutive failed sign-in attempts
      When a user submits an incorrect password for the fifth time
      Then the system rejects access
      And the system locks the account
      But the correct password no longer grants access while the account is locked
