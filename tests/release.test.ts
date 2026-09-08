import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'
import { root } from './helpers.js'

test('release configuration honors the documented Conventional Commit forms', () => {
  const script = `
    import release from './release.config.mjs'
    import { analyzeCommits } from '@semantic-release/commit-analyzer'
    const entry = release.plugins.find(plugin =>
      (Array.isArray(plugin) ? plugin[0] : plugin) === '@semantic-release/commit-analyzer')
    const configuration = Array.isArray(entry) ? entry[1] : {}
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
    process.stdout.write(JSON.stringify(outcomes))
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10_000,
  })
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout)).toEqual(['patch', 'minor', 'major', 'major', null])
})
