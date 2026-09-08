@code @authentication @security
Feature: User sign-in

  Allow registered users to access their accounts securely while rejecting invalid credentials and limiting repeated attempts.

  Background:
    Given the authentication service is available

  @credentials
  Rule: Credentials are verified securely

    The system SHALL grant access only when an active registered user provides the correct email address and password.

    @smoke @positive
    Scenario Outline: Sign-in succeeds with correct credentials
      Given an active registered account with these credentials:
        | email | password |
        | <storedEmail> | <storedPassword> |
      And the account has <priorFailureCount> consecutive failed sign-in attempts
      When the user signs in with email "<submittedEmail>" and password "<submittedPassword>"
      Then the system grants access to the account with email "<expectedAccountEmail>"
      And the system starts an authenticated session

      Examples: Matching credentials
        | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | expectedAccountEmail |
        | user@example.com | correct-password | 0 | user@example.com | correct-password | user@example.com |

    @negative @api
    Scenario Outline: Sign-in rejects invalid credentials
      Given only the following active account is registered:
        | email | password |
        | <storedEmail> | <storedPassword> |
      And the account has <priorFailureCount> consecutive failed sign-in attempts
      When a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
      Then the system rejects access with HTTP status <httpStatus>
      And the response body is:
        """json
        {
          "error": "<errorCode>"
        }
        """

      @unknown-account
      Examples: Unknown account
        | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | httpStatus | errorCode |
        | user@example.com | correct-password | 0 | missing@example.com | any-password | 401 | invalid_credentials |

      @incorrect-password
      Examples: Incorrect password
        | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | httpStatus | errorCode |
        | user@example.com | correct-password | 0 | user@example.com | wrong-password | 401 | invalid_credentials |

  @account-protection
  Rule: Repeated failures lock the account

    The system SHALL lock an account after five consecutive failed sign-in attempts. The system SHALL reject sign-in while the account is locked, even when the submitted credentials are correct.

    @negative @lockout
    Scenario Outline: Sign-in locks the account at the failure limit
      Given an active registered account with these credentials:
        | email | password |
        | <storedEmail> | <storedPassword> |
      And the account has <priorFailureCount> consecutive failed sign-in attempts
      When a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
      Then the system rejects access
      And the account has <expectedFailureCount> consecutive failed sign-in attempts
      And the system locks the account

      Examples: Failure limit reached
        | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | expectedFailureCount |
        | user@example.com | correct-password | 4 | user@example.com | wrong-password | 5 |

    @negative @lockout
    Scenario Outline: A locked account rejects correct credentials
      Given a registered account with these credentials:
        | email | password |
        | <storedEmail> | <storedPassword> |
      And the account has <priorFailureCount> consecutive failed sign-in attempts
      But the account is locked
      When a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
      Then the system rejects access

      Examples: Correct credentials while locked
        | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword |
        | user@example.com | correct-password | 5 | user@example.com | correct-password |
