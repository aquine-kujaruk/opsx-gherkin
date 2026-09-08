`@openspec-delta`
# Feature: Authentication delta

Update authentication behavior.

`@openspec-added`
## Rule: Recovery codes

The system SHALL accept one unused recovery code.

### Scenario: Use a recovery code

* When an unused recovery code is submitted
* Then access is granted

`@openspec-modified`
## Rule: Password sign-in

The system SHALL reject an incorrect password.

### Scenario: Reject an incorrect password

* When an incorrect password is submitted
* Then access is rejected

`@openspec-removed`
## Rule: Security questions

`@openspec-renamed`
## Rule: Rename requirement

FROM: `### Requirement: Login audit`
TO: `### Requirement: Authentication audit`
