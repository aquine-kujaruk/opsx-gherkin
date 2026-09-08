import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'vitest'
import { mdgToOpsx, opsxToFeature, opsxToMdg } from '../src/convert.js'
import {
  parseAndValidateFeature,
  parseAndValidateMdg,
  validateOpenSpec,
} from '../src/validation/official.js'
import { mdgModel } from './helpers.js'

const root = resolve(import.meta.dirname, '..')

test('normative contract is valid MDG and reaches a stable canonical round-trip', async () => {
  const source = await readFile(
    join(root, 'skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md'),
    'utf8',
  )
  assert.equal(parseAndValidateMdg(source).valid, true)

  const opsx = await mdgToOpsx(source, { sourcePath: 'OPENSPEC_MDG_PROFILE.feature.md' })
  const mdg = await opsxToMdg(opsx, { name: 'openspec-mdg-profile' })
  const secondOpsx = await mdgToOpsx(mdg, { name: 'openspec-mdg-profile' })

  assert.equal(secondOpsx, opsx)
  assert.equal(
    (await validateOpenSpec(opsx, { kind: 'main', name: 'openspec-mdg-profile' })).valid,
    true,
  )
})

test('package help directs agents to the exact normative profile', async () => {
  const executable = join(root, 'dist/cli.mjs')
  const help = spawnSync(process.execPath, [executable, '--help'], { encoding: 'utf8' })
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /opsx-gherkin profile/)
  assert.match(help.stdout, /opsx-to-feature[\s\S]*\.feature/)

  const profile = spawnSync(process.execPath, [executable, 'profile'], { encoding: 'utf8' })
  assert.equal(profile.status, 0, profile.stderr)
  assert.equal(
    profile.stdout,
    await readFile(
      join(root, 'skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md'),
      'utf8',
    ),
  )
})

test('OpenSpec projects to an officially valid plain Gherkin feature', async () => {
  const mdg = await readFile(join(root, 'tests/fixtures/user-sign-in.feature.md'), 'utf8')
  const opsx = await mdgToOpsx(mdg, { sourcePath: 'tests/fixtures/user-sign-in.feature.md' })
  const command = spawnSync(
    process.execPath,
    [join(root, 'dist/cli.mjs'), 'opsx-to-feature', '--text', opsx],
    { encoding: 'utf8' },
  )
  assert.equal(command.status, 0, command.stderr)
  const feature = command.stdout

  assert.equal(parseAndValidateFeature(feature).valid, true)
  assert.match(feature, /^@authentication @security\nFeature: User sign-in/m)
  assert.match(feature, /^ {2}Background:/m)
  assert.match(feature, /^ {2}@credentials\n {2}Rule:/m)
  assert.match(feature, /^ {4}Scenario Outline:/m)
  assert.match(feature, /^ {6}Examples: Unknown account/m)
  assert.match(feature, /^ {8}\|/m)
  assert.match(feature, /^ {8}"""json/m)
  assert.doesNotMatch(feature, /^#/m)
  assert.doesNotMatch(feature, /\|\s*---\s*\|/)
})

test('OpenSpec delta projects all operations to valid plain Gherkin', async () => {
  const opsx = await mdgToOpsx(deltaMdg, { name: 'authentication' })
  const feature = await opsxToFeature(opsx, { name: 'authentication' })

  assert.equal(parseAndValidateFeature(feature).valid, true)
  assert.match(feature, /^@openspec-delta$/m)
  for (const tag of ['added', 'modified', 'removed', 'renamed'])
    assert.match(feature, new RegExp(`@openspec-${tag}`))
})

test('full MDG surface remains stable through OpenSpec', async () => {
  const source = await readFile(join(root, 'tests/fixtures/user-sign-in.feature.md'), 'utf8')
  const opsx = await mdgToOpsx(source, { sourcePath: 'tests/fixtures/user-sign-in.feature.md' })
  const mdg = await opsxToMdg(opsx, { name: 'user-sign-in' })
  const secondOpsx = await mdgToOpsx(mdg, { name: 'user-sign-in' })

  assert.equal(secondOpsx, opsx)
  assert.match(mdg, /## Background:/)
  assert.match(mdg, /### Scenario Outline:/)
  assert.match(mdg, /#### Examples: Unknown account/)
  assert.match(mdg, /```json/)
})

test('MDG table input variants preserve cases and canonicalize without separators', async () => {
  const withSeparators = await readFile(
    join(root, 'tests/fixtures/user-sign-in.feature.md'),
    'utf8',
  )
  const withoutSeparators = withSeparators.replace(/^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/gm, '')
  assert.deepEqual(mdgModel(withoutSeparators), mdgModel(withSeparators))
  const opsx = await mdgToOpsx(withSeparators)
  assert.equal(await mdgToOpsx(withoutSeparators), opsx)
  assert.match(opsx, /^ {2}\| ---/m)
  const mdg = await opsxToMdg(opsx)
  assert.doesNotMatch(mdg, /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/m)
  assert.deepEqual(mdgModel(mdg), mdgModel(withSeparators))
  assert.equal(parseAndValidateMdg(mdg).pickles.length, 4)
  assert.equal(await mdgToOpsx(mdg), opsx)
})

test('all four OpenSpec delta operations round-trip canonically', async () => {
  const opsx = await mdgToOpsx(deltaMdg, { name: 'authentication' })
  assert.match(opsx, /## ADDED Requirements/)
  assert.match(opsx, /## MODIFIED Requirements/)
  assert.match(opsx, /## REMOVED Requirements/)
  assert.match(opsx, /## RENAMED Requirements/)
  assert.equal(
    (await validateOpenSpec(opsx, { kind: 'delta', name: 'authentication' })).valid,
    true,
  )

  const mdg = await opsxToMdg(opsx, { name: 'authentication' })
  const secondOpsx = await mdgToOpsx(mdg, { name: 'authentication' })
  assert.equal(secondOpsx, opsx)
  for (const tag of ['added', 'modified', 'removed', 'renamed'])
    assert.match(mdg, new RegExp(`@openspec-${tag}`))
})

test('undefined profile mappings are rejected without output', () => {
  const result = spawnSync(
    process.execPath,
    [join(root, 'dist/mdg-to-opsx.mjs'), '--text', invalidRuleMdg],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /SHALL or MUST/)
})

test('CLI supports stdin, output paths, collision protection, and force', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'opsx-mdg-cli-'))
  const output = join(temporary, 'sign-in.md')
  try {
    const first = spawnSync(process.execPath, [join(root, 'dist/mdg-to-opsx.mjs'), '-o', output], {
      input: simpleMdg,
      encoding: 'utf8',
    })
    assert.equal(first.status, 0, first.stderr)
    assert.match(await readFile(output, 'utf8'), /## Requirements/)

    const collision = spawnSync(
      process.execPath,
      [join(root, 'dist/mdg-to-opsx.mjs'), '--text', simpleMdg, '-o', output],
      { encoding: 'utf8' },
    )
    assert.equal(collision.status, 2)
    assert.match(collision.stderr, /already exists/)

    const forced = spawnSync(
      process.execPath,
      [join(root, 'dist/mdg-to-opsx.mjs'), '--text', simpleMdg, '-o', output, '--force'],
      { encoding: 'utf8' },
    )
    assert.equal(forced.status, 0, forced.stderr)
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
})

const simpleMdg = `# Feature: Sign in

Allow registered users to access their accounts securely by submitting their credentials.

## Rule: Correct credentials grant access

The system SHALL grant access for correct credentials.

### Scenario: Successful sign-in

* Given a registered user
* When correct credentials are submitted
* Then access is granted
`

const invalidRuleMdg = `# Feature: Sign in

Allow registered users to access their accounts securely by submitting their credentials.

## Rule: Correct credentials grant access

Correct credentials grant access.

### Scenario: Successful sign-in

* Given a registered user
* When correct credentials are submitted
* Then access is granted
`

const deltaMdg = `\`@openspec-delta\`
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
