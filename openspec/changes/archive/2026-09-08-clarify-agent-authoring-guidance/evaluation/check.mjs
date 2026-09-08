// Re-run from the repository root: node openspec/changes/archive/2026-09-08-clarify-agent-authoring-guidance/evaluation/check.mjs
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateMessages } from '@cucumber/gherkin'
import { IdGenerator, SourceMediaType } from '@cucumber/messages'

const evidence = fileURLToPath(new URL('.', import.meta.url))
const root = fileURLToPath(new URL('.', import.meta.resolve('opsx-gherkin/package.json')))
const cli = join(root, 'dist/cli.mjs')
const validator = join(root, 'dist/validate-spec.mjs')
const { Validator } = await import(new URL('./core/validation/validator.js', import.meta.resolve('@fission-ai/openspec')).href)
const results = []

function parse(text, plain = false) {
  const messages = generateMessages(text, plain ? 'case.feature' : 'case.feature.md',
    plain ? SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN : SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_MARKDOWN,
    { includeGherkinDocument: true, includePickles: true, newId: IdGenerator.incrementing() })
  assert.deepEqual(messages.flatMap((m) => m.parseError ? [m.parseError] : []), [])
  return {
    feature: messages.find((m) => m.gherkinDocument)?.gherkinDocument.feature,
    pickles: messages.flatMap((m) => m.pickle ? [m.pickle] : []),
  }
}

for (const phase of ['original', 'revised']) {
  for (const name of ['minimal', 'arguments', 'delta']) {
    for (const version of ['draft', 'final']) {
      const folder = join(evidence, 'runs', phase, name)
      const input = join(folder, `${version}.feature.md`)
      const text = await readFile(input, 'utf8')
      const result = { phase, name, version, commands: [], assertions: [] }
      const temporary = await mkdtemp(join(tmpdir(), 'opsx-evidence-check-'))
      function command(binary, args) {
        try {
          const stdout = execFileSync(process.execPath, [binary, ...args], { encoding: 'utf8' })
          result.commands.push({ binary: binary === cli ? 'opsx-gherkin' : 'validate-spec', args, exit: 0, stdout })
          return stdout
        } catch (error) {
          result.commands.push({ args, exit: error.status, stdout: error.stdout, stderr: error.stderr })
          throw error
        }
      }
      function check(label, fn) {
        try { fn(); result.assertions.push({ label, passed: true }) }
        catch (error) { result.assertions.push({ label, passed: false, error: error.message }) }
      }
      try {
        command(validator, ['--format', 'mdg', input])
        const opsx = join(temporary, 'case.openspec.md')
        const plain = join(temporary, 'case.feature')
        command(cli, ['mdg-to-opsx', input, '-o', opsx])
        if (name === 'delta') {
          // The standalone validator is for main specs; use the official delta endpoint.
          const change = join(temporary, 'change')
          const spec = join(change, 'specs', 'circulation')
          await mkdir(spec, { recursive: true })
          await writeFile(join(spec, 'spec.md'), await readFile(opsx))
          const report = await new Validator(true).validateChangeDeltaSpecs(change)
          result.commands.push({ binary: 'OpenSpec Validator.validateChangeDeltaSpecs(strict=true)', exit: report.valid ? 0 : 1, report })
          assert.equal(report.valid, true)
        } else command(validator, ['--format', 'openspec', opsx])
        command(cli, ['opsx-to-mdg', opsx, '-o', join(temporary, 'roundtrip.feature.md')])
        command(cli, ['opsx-to-feature', opsx, '-o', plain])
        command(validator, ['--format', 'feature', plain])
        result.conversion = 'All official endpoints and converter model-preservation checks passed'
        if (version === 'final') {
          const suppliedOpsx = await readFile(join(folder, 'final.openspec.md'), 'utf8')
          const suppliedPlain = await readFile(join(folder, 'final.feature'), 'utf8')
          assert.equal(suppliedOpsx, await readFile(opsx, 'utf8'))
          assert.equal(suppliedPlain, await readFile(plain, 'utf8'))
        }
        const parsed = parse(text)
        const projected = parse(await readFile(plain, 'utf8'), true)
        // Cucumber's Markdown AST omits prose; the validated plain projection
        // includes descriptions recovered by the converter's preserved model.
        const rules = projected.feature.children.flatMap((child) => child.rule ? [child.rule] : [])
        const scenarios = rules.flatMap((rule) => rule.children.flatMap((child) => child.scenario ? [child.scenario] : []))
        const count = { minimal: 1, arguments: 3, delta: 2 }[name]
        check('Requested expanded-case count in MDG and plain Gherkin', () => {
          assert.equal(parsed.pickles.length, count)
          assert.equal(projected.pickles.length, count)
        })
        result.content = {
          name: parsed.feature.name, description: projected.feature.description,
          tags: parsed.feature.tags.map((tag) => tag.name),
          rules: rules.map((rule) => ({ name: rule.name, description: rule.description, tags: rule.tags.map((tag) => tag.name) })),
          scenarios: scenarios.map((scenario) => ({ name: scenario.name, keyword: scenario.keyword, tags: scenario.tags.map((tag) => tag.name) })),
          expanded: parsed.pickles.map((pickle) => ({ name: pickle.name, steps: pickle.steps.map((step) => ({ text: step.text, argument: step.argument })) })),
        }
        if (name === 'minimal') {
          check('One normative Rule, one Scenario, meaningful description, no incidental tags', () => {
            assert.equal(rules.length, 1)
            assert.match(rules[0].description, /\b(SHALL|MUST)\b/)
            assert.equal(scenarios.length, 1)
            assert.equal(scenarios[0].keyword, 'Scenario')
            assert.ok(projected.feature.description.trim().length > 0)
            assert.deepEqual([...parsed.feature.tags, ...rules[0].tags, ...scenarios[0].tags], [])
          })
        }
        if (name === 'arguments') {
          check('One Outline and two correctly bound Examples groups', () => {
            assert.equal(rules.length, 1)
            assert.match(rules[0].description, /\b(SHALL|MUST)\b/)
            assert.equal(scenarios.length, 1)
            const [scenario] = scenarios
            assert.equal(scenario.keyword, 'Scenario Outline')
            assert.deepEqual(scenario.examples.map((group) => group.name), ['Accepted', 'Rejected'])
            assert.deepEqual(scenario.examples.map((group) => group.tableBody.map((row) => row.cells.map((cell) => cell.value))), [[['1', 'accepted'], ['2', 'accepted']], [['0', 'rejected']]])
          })
          check('Decoded table/JSON values and outcomes in all three expanded cases', () => {
            for (const [index, pickle] of parsed.pickles.entries()) {
              const table = pickle.steps.find((step) => step.argument?.dataTable)?.argument.dataTable
              assert.deepEqual(table.rows.map((row) => row.cells.map((cell) => cell.value)), [['field', 'value'], ['shelf', 'A|B'], ['source', 'C:\\catalog']])
              const doc = pickle.steps.find((step) => step.argument?.docString)?.argument.docString
              assert.equal(doc.mediaType, 'json')
              assert.deepEqual(JSON.parse(doc.content), { copies: [1, 2, 0][index], shelf: 'A|B', source: 'C:\\catalog' })
              assert.match(pickle.steps.at(-1).text, index === 2 ? /rejected/ : /accepted/)
              assert.ok(pickle.steps.every((step) => !/<[^>]+>/.test(step.text)))
            }
          })
        }
        if (name === 'delta') {
          check('All four operation identities and content boundaries', () => {
            assert.ok(parsed.feature.tags.some((tag) => tag.name === '@openspec-delta'))
            assert.deepEqual(rules.map((rule) => rule.tags.filter((tag) => tag.name.startsWith('@openspec-')).map((tag) => tag.name)), [['@openspec-added'], ['@openspec-modified'], ['@openspec-removed'], ['@openspec-renamed']])
            assert.deepEqual(rules.slice(0, 3).map((rule) => rule.name), ['Renew a loan', 'Reserve an available book', 'Fax reservation'])
            for (const rule of rules.slice(0, 2)) assert.match(rule.description, /\b(SHALL|MUST)\b/)
            assert.equal(rules[2].description, '')
            assert.deepEqual(rules[2].children, [])
            assert.deepEqual(rules[3].children, [])
            assert.equal(rules[3].description.trim().split('\n').map((line) => line.trim()).join('\n'), 'FROM: ### Requirement: Loan audit\nTO: ### Requirement: Circulation audit')
            assert.ok(text.includes('FROM: `### Requirement: Loan audit`\nTO: `### Requirement: Circulation audit`'))
          })
        }
      } catch (error) {
        result.error = error.message
      } finally {
        await rm(temporary, { recursive: true, force: true })
      }
      results.push(result)
    }
  }
}
await writeFile(join(evidence, 'checks.json'), `${JSON.stringify(results, null, 2)}\n`)
for (const result of results) console.log(`${result.phase}/${result.name}/${result.version}: ${result.error || (result.assertions.every((a) => a.passed) ? 'PASS' : 'FAIL')}`)
if (results.some((result) => result.error || result.assertions.some((a) => !a.passed))) process.exitCode = 1
