import assert from 'node:assert/strict'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { mdgToOpsx, opsxToFeature, opsxToMdg } from '../src/convert.js'
import { assertPreserved } from '../src/model.js'
import { parseFeatureModel } from '../src/parsers/feature.js'
import { detectOpenSpecKind, parseOpenSpecModel } from '../src/parsers/openspec.js'
import * as mdgRenderer from '../src/renderers/mdg.js'
import {
  parseAndValidateFeature,
  parseAndValidateMdg,
  validateOpenSpec,
} from '../src/validation/official.js'
import { delta, fixture, mdgModel, simple } from './helpers.js'

afterEach(() => vi.restoreAllMocks())

describe('document model preservation', () => {
  test('retains concrete metadata, rows, step arguments, and expanded examples', async () => {
    const text = await fixture('user-sign-in.feature.md')
    const model = mdgModel(text)
    expect(model.tags).toEqual(['@authentication', '@security'])
    expect(model.background?.steps[1].table).toEqual([
      ['email', 'password', 'status'],
      ['user@example.com', 'correct-password', 'active'],
    ])
    const outline = model.rules[0].scenarios[1]
    expect(outline.examples.map((group) => [group.name, group.tags, group.rows.length])).toEqual([
      ['Unknown account', ['@unknown-account'], 2],
      ['Incorrect password', ['@incorrect-password'], 2],
    ])
    expect(outline.steps[3].docString).toEqual({
      mediaType: 'json',
      content: '{\n  "error": "<error>"\n}',
    })
    const opsx = await mdgToOpsx(text)
    expect(parseOpenSpecModel(opsx, { kind: 'main', name: 'unused' })).toEqual(model)
    const plain = parseAndValidateFeature(await opsxToFeature(opsx))
    expect(plain.pickles).toHaveLength(4)
    expect(plain.pickles[1].steps[3].text).toContain('missing@example.com')
    assert.ok(plain.document)
    expect(parseFeatureModel(plain.document)).toEqual(model)
  })

  test('preserves scoped background and multiline descriptions', async () => {
    const text = simple
      .replace(
        '## Rule:',
        '## Background: Service\n\nShared setup.\n\n* Given a running service\n\n## Rule:',
      )
      .replace(
        '### Scenario:',
        '### Background: Account\n\nA prepared account.\n\n* Given the account exists\n\n### Scenario:',
      )
      .replace(
        '* Given a registered user',
        'Scenario explanation.\n  Nested explanation.\n\n* Given a registered user',
      )
    const source = mdgModel(text)
    expect(source.background?.name).toBe('Service')
    expect(source.rules[0].background?.description).toBe('A prepared account.')
    const opsx = await mdgToOpsx(text)
    expect(mdgModel(await opsxToMdg(opsx))).toEqual(source)
    const plain = parseAndValidateFeature(await opsxToFeature(opsx))
    assert.ok(plain.document)
    expect(parseFeatureModel(plain.document)).toEqual(source)
  })

  test('retains feature-level behavior through its reserved wrapper', async () => {
    const text = simple.replace(
      '## Rule: Correct credentials grant access\n\nThe system SHALL grant access for correct credentials.\n\n',
      '',
    )
    const opsx = await mdgToOpsx(text)
    expect(opsx).toContain('`@mdg-feature-scenarios`')
    const result = mdgModel(await opsxToMdg(opsx))
    expect(result.rules).toEqual([])
    expect(result.featureScenarios).toEqual(mdgModel(text).featureScenarios)
    expect(await opsxToFeature(opsx)).toContain('  Scenario: Successful sign-in')
  })

  test('preserves delta identity and both rename endpoints', async () => {
    const source = mdgModel(delta)
    expect(source.rules.map((rule) => rule.operation)).toEqual([
      'ADDED',
      'MODIFIED',
      'REMOVED',
      'RENAMED',
    ])
    expect(source.rules[3].rename).toEqual({ from: 'Login audit', to: 'Authentication audit' })
    const opsx = await mdgToOpsx(delta)
    expect(mdgModel(await opsxToMdg(opsx))).toEqual(source)
    const plain = parseAndValidateFeature(await opsxToFeature(opsx))
    assert.ok(plain.document)
    expect(parseFeatureModel(plain.document)).toEqual(source)
  })

  test('accepts BOM and CRLF without treating fenced headings as document structure', async () => {
    const text = simple.replace(
      '* Then access is granted',
      '* Then access is granted\n\n  ```text\n  ## REMOVED Requirements\n  ```',
    )
    const opsx = await mdgToOpsx(text)
    expect(detectOpenSpecKind(`\uFEFF${opsx.replaceAll('\n', '\r\n')}`)).toBe('main')
    expect(await opsxToMdg(`\uFEFF${opsx.replaceAll('\n', '\r\n')}`)).toBe(await opsxToMdg(opsx))
  })

  test('rejects a corrupted renderer result even when official parsing succeeds', async () => {
    const opsx = await mdgToOpsx(simple)
    vi.spyOn(mdgRenderer, 'serializeMdg').mockReturnValue(
      simple.replace('access is granted', 'access is denied'),
    )
    await expect(opsxToMdg(opsx)).rejects.toThrow('normalized document model')
  })

  test('compares literal values rather than object key insertion order', () => {
    const source = mdgModel(simple)
    const { rules, ...metadata } = source
    const same = { rules, ...metadata }
    expect(() => assertPreserved(source, same)).not.toThrow()
    const changed = structuredClone(source)
    changed.rules[0].scenarios[0].steps[2].text = 'access is denied'
    expect(() => assertPreserved(source, changed)).toThrow('normalized document model')
  })

  test('validates pinned main and delta endpoints and reports invalid content', async () => {
    expect((await validateOpenSpec(await mdgToOpsx(simple), { kind: 'main' })).valid).toBe(true)
    expect((await validateOpenSpec(await mdgToOpsx(delta), { kind: 'delta' })).valid).toBe(true)
    expect((await validateOpenSpec('# Broken', { kind: 'main' })).valid).toBe(false)
    expect((await validateOpenSpec('## ADDED Requirements\n', { kind: 'delta' })).valid).toBe(false)
    expect(
      parseAndValidateFeature(
        'Feature: Broken\n  Scenario: Unclosed\n    Then response is\n      """\n      body',
      ).valid,
    ).toBe(false)
    expect(parseAndValidateMdg('').valid).toBe(false)
  })
})
