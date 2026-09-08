import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMdgModel } from '../src/parsers/mdg.js'
import { parseAndValidateMdg } from '../src/validation/official.js'

export const root = fileURLToPath(new URL('..', import.meta.url))
export const fixture = (name: string) => readFile(join(root, 'tests/fixtures', name), 'utf8')
export const simple = `# Feature: Account access

Allow registered users to access their accounts with verified credentials.

## Rule: Correct credentials grant access

The system SHALL grant access for correct credentials.

### Scenario: Successful sign-in

* Given a registered user
* When correct credentials are submitted
* Then access is granted
`

export const delta = `\`@openspec-delta\`
# Feature: Authentication delta

Update authentication behavior.

\`@openspec-added\`
## Rule: Recovery codes

The system SHALL accept one unused recovery code.

### Scenario: Use a recovery code

* When an unused recovery code is submitted
* Then access is granted

\`@openspec-modified\`
## Rule: Password sign-in

The system SHALL reject an incorrect password.

### Scenario: Reject an incorrect password

* When an incorrect password is submitted
* Then access is rejected

\`@openspec-removed\`
## Rule: Security questions

\`@openspec-renamed\`
## Rule: Rename requirement

FROM: \`### Requirement: Login audit\`
TO: \`### Requirement: Authentication audit\`
`

export function mdgModel(text: string) {
  const report = parseAndValidateMdg(text)
  if (!report.valid || !report.document) throw new Error(JSON.stringify(report.errors))
  return parseMdgModel(text, report.document)
}
