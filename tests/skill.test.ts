import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import type { Pickle } from '@cucumber/messages'
import { expect, test } from 'vitest'
import { mdgToOpsx, opsxToFeature, opsxToMdg } from '../src/convert.js'
import { parseAndValidateFeature, parseAndValidateMdg } from '../src/validation/official.js'
import { mdgModel, root } from './helpers.js'

const skill = join(root, 'skills/opsx-gherkin')

const behavior = (pickles: Pickle[]) =>
  pickles.map((pickle) => ({
    name: pickle.name,
    tags: pickle.tags.map((tag) => tag.name),
    steps: pickle.steps.map(({ type, text, argument }) => ({ type, text, argument })),
  }))

test('bundled examples preserve their advertised structure and values', async () => {
  for (const [name, expectedCount] of [
    ['minimal', 1],
    ['account', 5],
    ['authentication-delta', 2],
  ] as const) {
    const mdg = await readFile(join(skill, `references/examples/${name}.feature.md`), 'utf8')
    const opsx = await readFile(join(skill, `references/examples/${name}.openspec.md`), 'utf8')
    expect(await mdgToOpsx(mdg)).toBe(opsx)
    expect(mdgModel(await opsxToMdg(opsx))).toEqual(mdgModel(mdg))
    const plain = await opsxToFeature(opsx)
    const cases = parseAndValidateMdg(mdg).pickles
    expect(cases).toHaveLength(expectedCount)
    expect(behavior(parseAndValidateFeature(plain).pickles)).toEqual(behavior(cases))
    expect(plain).toBe(await readFile(join(skill, `references/examples/${name}.feature`), 'utf8'))
    expect(plain).not.toMatch(/`<[^>]+>`/)
    for (const example of cases) {
      expect(example.tags.map((tag) => tag.name)).toContain('@code')
      expect(example.steps.filter((step) => step.type === 'Action')).toHaveLength(1)
      expect(example.steps[0].type).toBe('Context')
      expect(example.steps.at(-1)?.type).toBe('Outcome')
      expect(example.steps.some((step) => /<[^>]+>/.test(step.text))).toBe(false)
    }
    if (name === 'minimal') {
      const model = mdgModel(mdg)
      expect(model.description).not.toBe('')
      expect(model.tags).toEqual(['@code'])
      expect(model.featureScenarios).toEqual([])
      expect(model.background).toBeNull()
      expect(model.rules).toHaveLength(1)
      const [rule] = model.rules
      expect(rule.description).toMatch(/\b(SHALL|MUST)\b/)
      expect(rule.tags).toEqual([])
      expect(rule.background).toBeNull()
      expect(rule.scenarios).toHaveLength(1)
      const [scenario] = rule.scenarios
      expect(scenario.kind).toBe('outline')
      expect(scenario.tags).toEqual([])
      expect(scenario.examples).toHaveLength(1)
      expect(scenario.examples[0].rows).toEqual([
        ['productId', 'requestedQuantity', 'expectedQuantity'],
        ['P-7', '2', '2'],
      ])
      expect(scenario.steps.map((step) => step.keyword)).toEqual(['GIVEN', 'WHEN', 'THEN'])
      expect(scenario.steps[1].text).toContain('<requestedQuantity>')
      expect(scenario.steps[2].text).toContain('<expectedQuantity>')
      expect(cases[0].steps.map((step) => step.text)).toEqual([
        'an empty shopping cart',
        'the customer adds 2 units of product "P-7"',
        'the cart contains 2 units of product "P-7"',
      ])
    }
    if (name === 'account') {
      const action = (index: number) => cases[index].steps.find((step) => step.type === 'Action')
      expect(action(0)?.text).toContain('correct-password')
      expect(cases[0].steps.at(-1)?.text).toContain('starts an authenticated session')
      expect(action(1)?.text).toContain('missing@example.com')
      expect(action(2)?.text).toContain('wrong-password')
      for (const example of cases.slice(1, 3)) {
        const argument = example.steps.at(-1)?.argument?.docString
        expect(argument?.mediaType).toBe('json')
        expect(JSON.parse(argument?.content ?? '')).toEqual({ error: 'invalid_credentials' })
        expect(example.steps.some((step) => step.text.includes('401'))).toBe(true)
      }
      expect(cases[3].steps.at(-1)?.text).toContain('locks the account')
      expect(cases[3].steps.some((step) => step.type === 'Context' && /4/.test(step.text))).toBe(
        true,
      )
      expect(cases[3].steps.some((step) => step.type === 'Outcome' && /5/.test(step.text))).toBe(
        true,
      )
      expect(
        cases[4].steps.some((step) => step.type === 'Context' && /is locked/.test(step.text)),
      ).toBe(true)
      expect(action(4)?.text).toContain('correct-password')
      expect(cases[4].steps.at(-1)?.text).toContain('rejects access')
      for (const example of cases) {
        const table = example.steps.find((step) => step.argument?.dataTable)?.argument?.dataTable
        expect(table?.rows.map((row) => row.cells.map((cell) => cell.value))).toEqual([
          ['email', 'password'],
          ['user@example.com', 'correct-password'],
        ])
      }
    }
  }
})

test('embedded document pair and profile-access Feature preserve complete examples', async () => {
  const contract = await readFile(join(skill, 'references/OPENSPEC_MDG_PROFILE.feature.md'), 'utf8')
  const model = mdgModel(contract)
  const documents = model.rules.flatMap((rule) =>
    rule.scenarios.flatMap((scenario) =>
      scenario.steps.flatMap((step) =>
        step.docString?.mediaType === 'markdown' ? [step.docString.content] : [],
      ),
    ),
  )
  expect(documents).toHaveLength(2)
  const [opsx, mdg] = documents
  expect((await mdgToOpsx(mdg)).trimEnd()).toBe(opsx.trimEnd())
  expect(mdgModel(await opsxToMdg(opsx))).toEqual(mdgModel(mdg))
  const pairCases = parseAndValidateMdg(mdg).pickles
  expect(pairCases).toHaveLength(2)
  expect(pairCases[0].steps.at(-1)?.text).toContain('granted')
  expect(pairCases[1].steps.at(-1)?.text).toContain('rejected')
  for (const example of pairCases) {
    expect(example.tags.map((tag) => tag.name)).toContain('@code')
    expect(example.steps.filter((step) => step.type === 'Action')).toHaveLength(1)
  }
  const access = await readFile(join(skill, 'references/profile-access.feature.md'), 'utf8')
  expect(mdgModel(await opsxToMdg(await mdgToOpsx(access)))).toEqual(mdgModel(access))
  expect(parseAndValidateMdg(access).pickles).toHaveLength(3)
})

test('the copied skill resolves all document references inside its own bundle', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'opsx-skill-test-'))
  try {
    const copy = join(temporary, 'opsx-gherkin')
    await cp(skill, copy, { recursive: true })
    for (const name of await readdir(copy, { recursive: true })) {
      if (!name.endsWith('.md')) continue
      const file = join(copy, name)
      const text = await readFile(file, 'utf8')
      for (const [, reference] of text.matchAll(/\]\(([^)]+)\)/g)) {
        const target = resolve(dirname(file), reference)
        expect(isAbsolute(relative(copy, target))).toBe(false)
        expect(relative(copy, target).startsWith('..')).toBe(false)
        expect(await readFile(target, 'utf8')).not.toBe('')
      }
    }
    const contract = await readFile(
      join(copy, 'references/OPENSPEC_MDG_PROFILE.feature.md'),
      'utf8',
    )
    expect(parseAndValidateMdg(contract).valid).toBe(true)
    await expect(mdgToOpsx(contract)).resolves.toContain('## Requirements')
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
})
