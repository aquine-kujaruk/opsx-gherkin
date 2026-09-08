`@authentication` `@security`
# User sign-in

## Purpose

Allow registered users to access their accounts securely while rejecting invalid credentials and limiting repeated attempts.

## Requirements

**Background:**

- **GIVEN** the authentication service is available
- **AND** the following registered account exists:
  | email | password | status |
  | --- | --- | --- |
  | user@example.com | correct-password | active |

`@credentials`
### Requirement: Credentials are verified securely

The system SHALL grant access only when an active registered user provides the correct email address and password.

`@smoke` `@positive`
#### Scenario: Sign-in succeeds with correct credentials

- **GIVEN** the registered account from the background
- **WHEN** the user signs in with email `user@example.com` and password `correct-password`
- **THEN** the system grants access to the account
- **AND** the system starts an authenticated session

`@negative` `@api`
#### Scenario Outline: Sign-in rejects invalid credentials

- **GIVEN** the registered account from the background
- **WHEN** a user signs in with email `<email>` and password `<password>`
- **THEN** the system rejects access with status `<status>`
- **AND** the response body is:

  ```json
  {
    "error": "<error>"
  }
  ```

`@unknown-account`
##### Examples: Unknown account

  | email | password | status | error |
  | --- | --- | --- | --- |
  | missing@example.com | any-password | 401 | invalid_credentials |

`@incorrect-password`
##### Examples: Incorrect password

  | email | password | status | error |
  | --- | --- | --- | --- |
  | user@example.com | wrong-password | 401 | invalid_credentials |

`@account-protection`
### Requirement: Repeated failures lock the account

The system SHALL lock an account after five consecutive failed sign-in attempts.

`@negative` `@lockout`
#### Scenario: The fifth failed attempt locks the account

- **GIVEN** the registered account has four consecutive failed sign-in attempts
- **WHEN** a user submits an incorrect password for the fifth time
- **THEN** the system rejects access
- **AND** the system locks the account
- **BUT** the correct password no longer grants access while the account is locked
