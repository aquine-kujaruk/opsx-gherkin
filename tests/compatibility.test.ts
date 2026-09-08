import { describe, expect, test } from 'vitest'
import { mdgToOpsx, opsxToFeature, opsxToMdg } from '../src/convert.js'
import type { DocumentModel } from '../src/model.js'
import {
  detectOpenSpecKind,
  parseOpenSpecBody,
  parseOpenSpecModel,
} from '../src/parsers/openspec.js'
import { parseTable, resolveOpenSpecName } from '../src/syntax.js'
import { validateProfile } from '../src/validation/profile.js'
import { delta, mdgModel, simple } from './helpers.js'

describe('profile rejection', () => {
  test.each([
    ['empty input', '', /Invalid Markdown/],
    [
      'missing Feature name',
      simple.replace('Feature: Account access', 'Feature:'),
      /name is required/,
    ],
    [
      'missing Purpose',
      simple.replace(
        'Allow registered users to access their accounts with verified credentials.',
        '',
      ),
      /description is required/,
    ],
    ['missing behavior', '# Feature: Named\n\nAn explanation.', /no behavior/],
    ['nonnormative Rule', simple.replace(' SHALL ', ' can '), /SHALL or MUST/],
    ['Rule without behavior', simple.slice(0, simple.indexOf('### Scenario:')), /no scenarios/],
    ['empty Scenario', simple.slice(0, simple.indexOf('* Given')), /has no steps/],
    [
      'outline without Examples',
      simple.replace('### Scenario:', '### Scenario Outline:'),
      /no Examples/,
    ],
    ['reserved metadata', `\`@openspec-custom\`\n${simple}`, /Reserved tag/],
    [
      'operation on main Rule',
      simple.replace('## Rule:', '`@openspec-added`\n## Rule:'),
      /cannot use OpenSpec delta/,
    ],
    ['delta without operation tag', `\`@openspec-delta\`\n${simple}`, /exactly one/],
    [
      'multiple operation tags',
      delta.replace('`@openspec-added`', '`@openspec-added` `@openspec-modified`'),
      /exactly one/,
    ],
    [
      'delta with Background',
      delta.replace('`@openspec-added`', '## Background:\n\n* Given setup\n\n`@openspec-added`'),
      /feature-level Background/,
    ],
    ['nonnormative delta Rule', delta.replace('SHALL accept', 'can accept'), /SHALL or MUST/],
    [
      'removed Rule with prose',
      delta.replace(
        '## Rule: Security questions',
        '## Rule: Security questions\n\nExtra removal metadata.',
      ),
      /only its name/,
    ],
    [
      'incomplete rename',
      delta.replace('TO: `### Requirement: Authentication audit`', ''),
      /FROM and TO/,
    ],
  ])('%s', async (_label, text, error) => {
    await expect(mdgToOpsx(text)).rejects.toThrow(error)
  })

  test.each([
    [
      'delta Rule without scenarios',
      (model: DocumentModel) => {
        model.kind = 'delta'
        model.rules[0].operation = 'ADDED'
        model.rules[0].scenarios = []
      },
      /requires behavior/,
    ],
    [
      'rename without endpoints',
      (model: DocumentModel) => {
        model.kind = 'delta'
        model.rules[0].operation = 'RENAMED'
      },
      /FROM and TO/,
    ],
    [
      'Examples on plain scenario',
      (model: DocumentModel) => {
        model.rules[0].scenarios[0].examples = [
          { name: 'Values', description: '', tags: [], rows: [['a'], ['b']] },
        ]
      },
      /cannot contain Examples/,
    ],
    [
      'delta without operations',
      (model: DocumentModel) => {
        model.kind = 'delta'
        model.rules = []
      },
      /no operations/,
    ],
  ])('%s', (_label, alter, error) => {
    const model = mdgModel(simple)
    alter(model)
    expect(() => validateProfile(model, 'openspec')).toThrow(error)
  })

  test('fails mixed or absent requirement sections before conversion', async () => {
    expect(() => detectOpenSpecKind('## Requirements\n\n## ADDED Requirements')).toThrow(
      'mixes main and delta',
    )
    await expect(opsxToMdg('# Empty')).rejects.toThrow('no Requirements')
    await expect(opsxToFeature('# Empty')).rejects.toThrow('no Requirements')
    await expect(opsxToMdg('# Invalid\n\n## Requirements')).rejects.toThrow(
      'Invalid OpenSpec input',
    )
  })

  test('requires a name for titleless input and honors explicit or source context', async () => {
    const source = (await mdgToOpsx(simple)).replace(/^# .+\n/, '')
    await expect(opsxToMdg(source)).rejects.toThrow('requires --name')
    expect(await opsxToMdg(source, { name: 'Named specification' })).toContain(
      '# Feature: Named specification',
    )
    expect(await opsxToMdg(source, { sourcePath: '/specs/account-access/spec.md' })).toContain(
      '# Feature: account-access',
    )
    expect(resolveOpenSpecName('# Feature: Readable title', {})).toBe('Readable title')
  })
})

describe('OpenSpec syntax reader', () => {
  test('rejects unmapped removal metadata instead of silently dropping it', async () => {
    const text = (await mdgToOpsx(delta)).replace(
      '### Requirement: Security questions',
      '### Requirement: Security questions\n\n**Reason**: Extra content',
    )
    await expect(opsxToMdg(text)).rejects.toThrow('only its name')
  })

  test('rejects extra rename content', async () => {
    await expect(mdgToOpsx(`${delta}\nUnmapped note.\n`)).rejects.toThrow('unsupported content')
  })

  test('preserves delta group order and requirement order within groups', async () => {
    const groups = delta.split(/(?=`@openspec-(?:added|modified|removed|renamed)`)/)
    const reordered = [groups[0], groups[2], groups[1], groups[3], groups[4]].join('')
    const output = await mdgToOpsx(reordered)
    expect(output.indexOf('## MODIFIED')).toBeLessThan(output.indexOf('## ADDED'))
    expect(mdgModel(await opsxToMdg(output))).toEqual(mdgModel(reordered))
  })

  test('keeps escaped pipe, newline, and backslash cells as literal values', () => {
    expect(
      parseTable([
        '  | field | value |',
        '  | --- | --- |',
        '  | a\\|b | first\\nsecond |',
        '  | c | back\\\\slash |',
      ]),
    ).toEqual([
      ['field', 'value'],
      ['a|b', 'first\nsecond'],
      ['c', 'back\\slash'],
    ])
    expect(() => parseTable([])).toThrow('Empty table')
    expect(() => parseTable(['  | a | b |', '  | c |'])).toThrow('Inconsistent')
  })

  test('rejects malformed scenario lines and unclosed Doc Strings', () => {
    expect(() => parseOpenSpecBody(['- **WHEN** action', 'unexpected prose'])).toThrow(
      'Unsupported OpenSpec scenario line',
    )
    expect(() => parseOpenSpecBody(['- **THEN** result', '  ```json', '  {}'])).toThrow(
      'Unclosed OpenSpec DocString',
    )
    expect(parseOpenSpecBody(['Description only'])).toEqual({
      description: 'Description only',
      steps: [],
    })
  })

  test('parses a legacy rule Background without flattening its scope', async () => {
    const source = await mdgToOpsx(simple)
    const text = source.replace(
      '#### Scenario:',
      '**Background: Account**\n\n- **GIVEN** a prepared account\n\n#### Scenario:',
    )
    const model = parseOpenSpecModel(text, { kind: 'main', name: 'Account' })
    expect(model.rules[0].background).toEqual({
      name: 'Account',
      description: '',
      steps: [{ keyword: 'GIVEN', text: 'a prepared account', table: null, docString: null }],
    })
    expect(await opsxToMdg(text)).toContain('### Background: Account')
  })

  test('rejects unsupported preamble and incomplete rename records', () => {
    expect(() =>
      parseOpenSpecModel('## Requirements\n\nUnmapped preamble', { kind: 'main', name: 'Named' }),
    ).toThrow('expected **Background:**')
    expect(() =>
      parseOpenSpecModel('## RENAMED Requirements\n\n- FROM: `### Requirement: Old`', {
        kind: 'delta',
        name: 'Named',
      }),
    ).toThrow('no TO line')
  })
})
