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
  for (const [name, expectedCount, expectedTags] of [
    ['minimal', 1, []],
    ['authentication-delta', 2, ['@openspec-delta']],
  ] as const) {
    const mdg = await readFile(join(skill, `references/examples/${name}.feature.md`), 'utf8')
    const opsx = await readFile(join(skill, `references/examples/${name}.openspec.md`), 'utf8')
    expect(await mdgToOpsx(mdg)).toBe(opsx)
    expect(await opsxToMdg(opsx)).toBe(mdg)
    const plain = await opsxToFeature(opsx)
    const cases = parseAndValidateMdg(mdg).pickles
    expect(cases).toHaveLength(expectedCount)
    expect(behavior(parseAndValidateFeature(plain).pickles)).toEqual(behavior(cases))
    expect(plain).toBe(await readFile(join(skill, `references/examples/${name}.feature`), 'utf8'))
    expect(plain).not.toMatch(/`<[^>]+>`/)
    for (const example of cases) {
      const tags = example.tags.map((tag) => tag.name)
      expect(tags).toEqual(expect.arrayContaining([...expectedTags]))
      expect(example.steps.filter((step) => step.type === 'Action')).toHaveLength(1)
      expect(example.steps[0].type).toBe('Context')
      expect(example.steps.at(-1)?.type).toBe('Outcome')
      expect(example.steps.some((step) => /<[^>]+>/.test(step.text))).toBe(false)
    }
    if (name === 'minimal') {
      const model = mdgModel(mdg)
      expect(model.description).not.toBe('')
      expect(model.tags).toEqual([])
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
  expect((await opsxToMdg(opsx)).trimEnd()).toBe(mdg.trimEnd())
  const pairCases = parseAndValidateMdg(mdg).pickles
  expect(pairCases).toHaveLength(2)
  expect(pairCases[0].steps.at(-1)?.text).toContain('granted')
  expect(pairCases[1].steps.at(-1)?.text).toContain('rejected')
  for (const example of pairCases) {
    expect(example.tags.map((tag) => tag.name)).toContain('@authentication')
    expect(example.steps.filter((step) => step.type === 'Action')).toHaveLength(1)
  }
  const access = await readFile(join(skill, 'references/profile-access.feature.md'), 'utf8')
  expect(mdgModel(await opsxToMdg(await mdgToOpsx(access)))).toEqual(mdgModel(access))
  expect(parseAndValidateMdg(access).pickles).toHaveLength(3)
})

test('the skill and contract state the specification language and only syntax guidance', async () => {
  const entry = await readFile(join(skill, 'SKILL.md'), 'utf8')
  const contract = await readFile(join(skill, 'references/OPENSPEC_MDG_PROFILE.feature.md'), 'utf8')
  const prose = (text: string) => text.replace(/\s+/g, ' ')
  expect(prose(entry)).toContain(
    'Write specification content in English. Use another language only when the user or the ' +
      "project's `CLAUDE.md` or `AGENTS.md` explicitly requests it for the specifications;",
  )
  expect(prose(entry)).toContain(
    'Instructions about the language of other documents, such as proposals, do not apply.',
  )
  expect(contract).toContain(
    "Write specification content in English unless the user or the project's agent instructions",
  )
  for (const removed of ['use case', 'independent roles', 'without a separator row', 'account.'])
    expect(entry).not.toContain(removed)
  expect(prose(entry)).toContain('one separator row')
  expect(prose(entry)).toContain(
    'An HTML comment at the end of a step is step text: every conversion preserves it verbatim, ' +
      'and it has no meaning to the converter.',
  )
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
