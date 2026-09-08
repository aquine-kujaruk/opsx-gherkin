import { spawnSync } from 'node:child_process'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { writeAtomic } from '../src/cli/converter.js'
import { mdgToOpsx } from '../src/convert.js'
import { root, simple } from './helpers.js'

let directory: string
let opsx: string
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'opsx-cli-test-'))
  opsx = await mdgToOpsx(simple)
  await writeFile(join(directory, 'input.feature.md'), simple)
  await writeFile(join(directory, 'input.md'), opsx)
})
afterAll(async () => {
  await rm(directory, { recursive: true, force: true })
})

function run(bin: string, args: string[], input?: string) {
  return spawnSync(process.execPath, [join(root, 'dist', `${bin}.mjs`), ...args], {
    cwd: directory,
    encoding: 'utf8',
    input,
    timeout: 15000,
  })
}

describe('converter commands', () => {
  test.each(['mdg-to-opsx', 'opsx-to-mdg', 'opsx-to-feature'])(
    '%s has equivalent main and standalone entry points',
    (direction) => {
      const text = direction === 'mdg-to-opsx' ? simple : opsx
      const standalone = run(direction, ['--text', text])
      const main = run('cli', [direction, '--text', text])
      expect(standalone.status, standalone.stderr).toBe(0)
      expect([main.status, main.stdout, main.stderr]).toEqual([0, standalone.stdout, ''])
    },
  )

  test('reads path, inline text, and stdin without output contamination', () => {
    const outputs = [
      run('mdg-to-opsx', ['input.feature.md']),
      run('mdg-to-opsx', ['--text', simple]),
      run('mdg-to-opsx', [], simple),
    ]
    for (const result of outputs) {
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toBe(opsx)
      expect(result.stderr).toBe('')
    }
  })

  test.each([
    [['input.feature.md', '--text', simple], /either an input path or --text/],
    [['input.feature.md', 'second.feature.md'], /Only one input/],
    [['--missing'], /Unknown option/],
    [['--text'], /Missing value/],
    [['--force'], /requires --output/],
    [['does-not-exist.feature.md'], /ENOENT/],
  ])('reports usage or I/O failure for %j', (args, diagnostic) => {
    const result = run('mdg-to-opsx', args)
    expect(result.status).toBe(2)
    expect(result.stdout).toBe('')
    expect(result.stderr).toMatch(diagnostic)
  })

  test('accepts explicit name and project context for titleless OpenSpec', () => {
    const result = run('opsx-to-mdg', [
      '--text',
      opsx.replace(/^# .+\n/, ''),
      '--name',
      'Explicit account',
      '--project-root',
      directory,
    ])
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('# Feature: Explicit account')
  })

  test('protects output on collision and validation failure, including --force', async () => {
    const destination = join(directory, 'protected.md')
    await writeFile(destination, 'original bytes')
    expect(run('mdg-to-opsx', ['--text', simple, '-o', destination]).status).toBe(2)
    const rejected = run('mdg-to-opsx', [
      '--text',
      simple.replace(' SHALL ', ' can '),
      '--output',
      destination,
      '--force',
    ])
    expect(rejected.status).toBe(1)
    expect(rejected.stdout).toBe('')
    expect(await readFile(destination, 'utf8')).toBe('original bytes')
    const written = run('mdg-to-opsx', ['--text', simple, '--output', destination, '--force'])
    expect(written.status, written.stderr).toBe(0)
    expect(written.stdout).toBe('')
    expect(await readFile(destination, 'utf8')).toBe(opsx)
  })

  test('cleans up temporary files when publishing an output fails', async () => {
    const destination = join(directory, 'atomic.md')
    await writeAtomic(destination, 'first', false)
    await expect(writeAtomic(destination, 'second', false)).rejects.toThrow('already exists')
    await expect(writeAtomic(directory, 'cannot replace directory', true)).rejects.toThrow()
    expect(await readFile(destination, 'utf8')).toBe('first')
    expect((await readdir(directory)).filter((name) => name.endsWith('.tmp'))).toEqual([])
  })
})

describe('discovery and endpoint validation', () => {
  test('both profile aliases read the packaged skill regardless of cwd', async () => {
    const expected = await readFile(
      join(root, 'skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md'),
      'utf8',
    )
    for (const command of ['profile', 'instructions']) {
      const result = run('cli', [command])
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toBe(expected)
      expect(run('cli', [command, 'unexpected']).status).toBe(2)
    }
  })

  test('help and unknown commands use their documented output channels', () => {
    for (const args of [[], ['-h'], ['--help'], ['help']])
      expect(run('cli', args).stdout).toContain('opsx-gherkin profile')
    for (const direction of ['mdg-to-opsx', 'opsx-to-mdg', 'opsx-to-feature']) {
      const result = run(direction, ['--help'])
      expect(result.status).toBe(0)
      expect(result.stdout).toContain('--project-root')
    }
    const bad = run('cli', ['unrecognized'])
    expect(bad.status).toBe(2)
    expect(bad.stdout).toBe('')
    expect(bad.stderr).toContain('Unknown command')
  })

  test('validates formats, suffix defaults, and the legacy gherkin alias', async () => {
    await writeFile(
      join(directory, 'input.feature'),
      'Feature: Direct validation\n  Scenario: Accepted\n    Given an existing account\n',
    )
    for (const [file, format] of [
      ['input.md', 'openspec'],
      ['input.feature.md', 'mdg'],
      ['input.feature', 'feature'],
    ]) {
      for (const args of [[file], ['--format', format, file]]) {
        const result = run('validate-spec', args)
        expect(result.status, result.stderr).toBe(0)
        expect(JSON.parse(result.stdout)).toMatchObject({
          format,
          valid: true,
          file: join(directory, file),
        })
      }
    }
    expect(run('validate-spec', ['--format', 'gherkin', 'input.feature.md']).status).toBe(0)
    expect(run('validate-spec', ['--format', 'gherkin', 'input.feature']).status).toBe(0)
  })

  test('syntax validation is independent of conversion eligibility', async () => {
    await writeFile(join(directory, 'outside.feature.md'), simple.replace(' SHALL ', ' can '))
    expect(run('validate-spec', ['outside.feature.md']).status).toBe(0)
    expect(run('mdg-to-opsx', ['outside.feature.md']).status).toBe(1)
    await writeFile(join(directory, 'empty.feature.md'), '')
    const empty = run('validate-spec', ['empty.feature.md'])
    expect(empty.status).toBe(1)
    expect(JSON.parse(empty.stdout).valid).toBe(false)
  })

  test.each(
    [
      [],
      ['--format'],
      ['--format', 'invalid', 'input.md'],
      ['input.md', 'extra'],
      ['missing.md'],
      ['missing.feature'],
    ].map((args) => ({ args })),
  )('validator rejects $args', ({ args }) => {
    const result = run('validate-spec', args)
    expect(result.status).toBe(2)
    expect(result.stdout).toBe('')
    expect(result.stderr.length).toBeGreaterThan(0)
  })
})
