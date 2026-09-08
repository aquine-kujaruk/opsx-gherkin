import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'
import { root } from './helpers.js'

test('release configuration honors the documented Conventional Commit forms', () => {
  const script = `
    import release from './release.config.mjs'
    import { analyzeCommits } from '@semantic-release/commit-analyzer'
    import { generateNotes } from '@semantic-release/release-notes-generator'
    const entry = release.plugins.find(plugin =>
      (Array.isArray(plugin) ? plugin[0] : plugin) === '@semantic-release/commit-analyzer')
    const configuration = Array.isArray(entry) ? entry[1] : {}
    const notesEntry = release.plugins.find(plugin =>
      (Array.isArray(plugin) ? plugin[0] : plugin) === '@semantic-release/release-notes-generator')
    const notesConfiguration = Array.isArray(notesEntry) ? notesEntry[1] : {}
    const messages = [
      'fix: preserve table values',
      'feat: expose a converter',
      'feat!: change command syntax',
      'fix: adjust syntax\\n\\nBREAKING CHANGE: previous syntax is no longer accepted',
      'docs: explain syntax',
    ]
    const outcomes = []
    for (const message of messages) {
      outcomes.push(await analyzeCommits(configuration, {
        cwd: process.cwd(), commits: [{ message }], logger: { log() {} },
      }))
    }
    const notes = await generateNotes(notesConfiguration, {
      cwd: process.cwd(),
      commits: [{ message: messages[0], hash: '1234567890abcdef' }],
      lastRelease: { gitTag: 'v1.0.0' },
      nextRelease: { version: '1.0.1', gitTag: 'v1.0.1' },
      options: { repositoryUrl: 'https://github.com/aquine-kujaruk/opsx-gherkin.git' },
      logger: { log() {} },
    })
    process.stdout.write(JSON.stringify({ outcomes, notes }))
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10_000,
  })
  expect(result.status, result.stderr).toBe(0)
  const { outcomes, notes } = JSON.parse(result.stdout)
  expect(outcomes).toEqual(['patch', 'minor', 'major', 'major', null])
  expect(notes).toContain('preserve table values')
})
