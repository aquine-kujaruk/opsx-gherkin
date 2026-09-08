import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { mdgToOpsx, opsxToFeature, opsxToMdg } from '../src/convert.js'
import { parseAndValidateFeature, parseAndValidateMdg } from '../src/validation/official.js'
import { mdgModel, root } from './helpers.js'

const skill = join(root, 'skills/opsx-gherkin')

test('bundled examples preserve their advertised structure and values', async () => {
  for (const name of ['account', 'authentication-delta']) {
    const mdg = await readFile(join(skill, `references/examples/${name}.feature.md`), 'utf8')
    const opsx = await readFile(join(skill, `references/examples/${name}.openspec.md`), 'utf8')
    expect(await mdgToOpsx(mdg)).toBe(opsx)
    expect(mdgModel(await opsxToMdg(opsx))).toEqual(mdgModel(mdg))
    const plain = await opsxToFeature(opsx)
    const expectedCount = name === 'account' ? 4 : 2
    expect(parseAndValidateMdg(mdg).pickles).toHaveLength(expectedCount)
    expect(parseAndValidateFeature(plain).pickles).toHaveLength(expectedCount)
    if (name === 'account')
      expect(plain).toBe(await readFile(join(skill, 'references/examples/account.feature'), 'utf8'))
  }
})

test('the copied skill resolves all entry-point references inside its own bundle', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'opsx-skill-test-'))
  try {
    const copy = join(temporary, 'opsx-gherkin')
    await cp(skill, copy, { recursive: true })
    const entry = await readFile(join(copy, 'SKILL.md'), 'utf8')
    const references = [...entry.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1])
    expect(references.length).toBeGreaterThan(0)
    for (const reference of references) {
      expect(reference.startsWith('references/')).toBe(true)
      expect(await readFile(join(copy, reference), 'utf8')).not.toBe('')
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
