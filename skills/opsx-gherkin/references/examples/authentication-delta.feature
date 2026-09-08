@code @openspec-delta
Feature: Authentication delta

  STRUCTURAL CHANGE DOCUMENT: This Feature packages OpenSpec delta operations for authentication software. It demonstrates a change document, not one completed application use case. The added and modified requirements contain complete behavioral examples; removal and rename contain only the names allowed by the conversion contract.

  @openspec-added
  Rule: Recovery codes

    The system SHALL accept one unused recovery code.

    Scenario Outline: An unused recovery code grants account access
      Given the account with email "<accountEmail>" has the unused recovery code "<storedRecoveryCode>"
      When a user requests account access for "<submittedEmail>" with recovery code "<submittedRecoveryCode>"
      Then access is granted to the account with email "<expectedAccountEmail>"

      Examples: Matching unused recovery code
        | accountEmail | storedRecoveryCode | submittedEmail | submittedRecoveryCode | expectedAccountEmail |
        | user@example.com | recovery-7 | user@example.com | recovery-7 | user@example.com |

  @openspec-modified
  Rule: Password sign-in

    The system SHALL reject an incorrect password.

    Scenario Outline: An incorrect password rejects account access
      Given the account with email "<accountEmail>" has the password "<storedPassword>"
      When a user signs in with email "<submittedEmail>" and password "<submittedPassword>"
      Then access is rejected

      Examples: Password mismatch
        | accountEmail | storedPassword | submittedEmail | submittedPassword |
        | user@example.com | correct-password | user@example.com | wrong-password |

  @openspec-removed
  Rule: Security questions

  @openspec-renamed
  Rule: Rename requirement

    FROM: ### Requirement: Login audit
    TO: ### Requirement: Authentication audit
