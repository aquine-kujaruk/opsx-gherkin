`@code` `@authentication` `@security`
# User sign-in

## Purpose

Allow registered users to access their accounts securely while rejecting invalid credentials and limiting repeated attempts.

## Requirements

**Background:**

- **GIVEN** the authentication service is available

`@credentials`
### Requirement: Credentials are verified securely

The system SHALL grant access only when an active registered user provides the correct email address and password.

`@smoke` `@positive`
#### Scenario Outline: Sign-in succeeds with correct credentials

- **GIVEN** an active registered account with these credentials:
  | email | password |
  | --- | --- |
  | <storedEmail> | <storedPassword> |
- **AND** the account has <priorFailureCount> consecutive failed sign-in attempts
- **WHEN** the user signs in with email "<submittedEmail>" and password "<submittedPassword>"
- **THEN** the system grants access to the account with email "<expectedAccountEmail>"
- **AND** the system starts an authenticated session

##### Examples: Matching credentials

  | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | expectedAccountEmail |
  | --- | --- | --- | --- | --- | --- |
  | user@example.com | correct-password | 0 | user@example.com | correct-password | user@example.com |

`@negative` `@api`
#### Scenario Outline: Sign-in rejects invalid credentials

- **GIVEN** only the following active account is registered:
  | email | password |
  | --- | --- |
  | <storedEmail> | <storedPassword> |
- **AND** the account has <priorFailureCount> consecutive failed sign-in attempts
- **WHEN** a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
- **THEN** the system rejects access with HTTP status <httpStatus>
- **AND** the response body is:

  ```json
  {
    "error": "<errorCode>"
  }
  ```

`@unknown-account`
##### Examples: Unknown account

  | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | httpStatus | errorCode |
  | --- | --- | --- | --- | --- | --- | --- |
  | user@example.com | correct-password | 0 | missing@example.com | any-password | 401 | invalid_credentials |

`@incorrect-password`
##### Examples: Incorrect password

  | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | httpStatus | errorCode |
  | --- | --- | --- | --- | --- | --- | --- |
  | user@example.com | correct-password | 0 | user@example.com | wrong-password | 401 | invalid_credentials |

`@account-protection`
### Requirement: Repeated failures lock the account

The system SHALL lock an account after five consecutive failed sign-in attempts. The system SHALL reject sign-in while the account is locked, even when the submitted credentials are correct.

`@negative` `@lockout`
#### Scenario Outline: Sign-in locks the account at the failure limit

- **GIVEN** an active registered account with these credentials:
  | email | password |
  | --- | --- |
  | <storedEmail> | <storedPassword> |
- **AND** the account has <priorFailureCount> consecutive failed sign-in attempts
- **WHEN** a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
- **THEN** the system rejects access
- **AND** the account has <expectedFailureCount> consecutive failed sign-in attempts
- **AND** the system locks the account

##### Examples: Failure limit reached

  | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword | expectedFailureCount |
  | --- | --- | --- | --- | --- | --- |
  | user@example.com | correct-password | 4 | user@example.com | wrong-password | 5 |

`@negative` `@lockout`
#### Scenario Outline: A locked account rejects correct credentials

- **GIVEN** a registered account with these credentials:
  | email | password |
  | --- | --- |
  | <storedEmail> | <storedPassword> |
- **AND** the account has <priorFailureCount> consecutive failed sign-in attempts
- **BUT** the account is locked
- **WHEN** a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
- **THEN** the system rejects access

##### Examples: Correct credentials while locked

  | storedEmail | storedPassword | priorFailureCount | submittedEmail | submittedPassword |
  | --- | --- | --- | --- | --- |
  | user@example.com | correct-password | 5 | user@example.com | correct-password |
