import type {
  Background,
  Examples,
  GherkinDocument,
  Rule,
  Scenario,
  Step,
} from '@cucumber/messages'
import { DELTA_TAG, OPERATION_TAGS } from '../constants.js'
import { ConversionError } from '../errors.js'
import type {
  BackgroundModel,
  DocumentModel,
  ExamplesModel,
  Operation,
  RuleModel,
  ScenarioModel,
  StepModel,
} from '../model.js'
import type { LocatedChild } from '../syntax.js'
import { nextSiblingLine, nodeLine, normalizeLines, proseBetween, tagStartLine } from '../syntax.js'

export function parseMdgModel(text: string, document: GherkinDocument): DocumentModel {
  const feature = document.feature
  if (!feature) throw new ConversionError('Gherkin document has no Feature')
  const lines = normalizeLines(text)
  const featureChildren = [...feature.children].sort((a, b) => nodeLine(a) - nodeLine(b))
  const firstFeatureChild = featureChildren[0]
    ? tagStartLine(lines, featureChildren[0])
    : lines.length + 1
  const description = proseBetween(lines, feature.location.line + 1, firstFeatureChild)
  const featureTags = feature.tags.map((tag) => tag.name)
  const isDelta = featureTags.includes(DELTA_TAG)
  const model: DocumentModel = {
    kind: isDelta ? 'delta' : 'main',
    name: feature.name.trim(),
    description,
    tags: featureTags.filter((tag) => tag !== DELTA_TAG),
    background: null,
    featureScenarios: [],
    rules: [],
  }

  for (let index = 0; index < featureChildren.length; index += 1) {
    const child = featureChildren[index]
    const boundary = featureChildren[index + 1]
      ? tagStartLine(lines, featureChildren[index + 1])
      : lines.length + 1
    if (child.background)
      model.background = mapMdgBackground(child.background, lines, featureChildren)
    if (child.scenario) model.featureScenarios.push(mapMdgScenario(child.scenario, lines))
    if (child.rule) model.rules.push(mapMdgRule(child.rule, lines, isDelta, boundary))
  }
  return model
}

export function mapMdgRule(
  rule: Rule,
  lines: string[],
  isDelta: boolean,
  boundary: number,
): RuleModel {
  const children = [...rule.children].sort((a, b) => nodeLine(a) - nodeLine(b))
  const firstChild = children[0] ? tagStartLine(lines, children[0]) : lines.length + 1
  const tags = rule.tags.map((tag) => tag.name)
  const operationTags = tags.filter((tag) => OPERATION_TAGS.has(tag))
  let operation: Operation | undefined
  if (isDelta) {
    if (operationTags.length !== 1) {
      throw new ConversionError(
        `Delta Rule "${rule.name}" must have exactly one @openspec operation tag`,
      )
    }
    operation = OPERATION_TAGS.get(operationTags[0])
  } else if (operationTags.length) {
    throw new ConversionError(
      `Main-spec Rule "${rule.name}" cannot use OpenSpec delta operation tags`,
    )
  }
  const description = proseBetween(
    lines,
    rule.location.line + 1,
    children.length ? firstChild : boundary,
  )
  const mapped: RuleModel = {
    name: rule.name.trim(),
    description,
    tags: tags.filter((tag) => !OPERATION_TAGS.has(tag)),
    operation,
    rename: null,
    background: null,
    scenarios: [],
  }
  for (const child of children) {
    if (child.background) mapped.background = mapMdgBackground(child.background, lines, children)
    if (child.scenario) mapped.scenarios.push(mapMdgScenario(child.scenario, lines))
  }
  if (operation === 'RENAMED') {
    const from = description.match(/^FROM:\s*`### Requirement:\s*(.+?)`\s*$/im)?.[1]
    const to = description.match(/^TO:\s*`### Requirement:\s*(.+?)`\s*$/im)?.[1]
    if (!from || !to)
      throw new ConversionError(`RENAMED Rule "${rule.name}" requires FROM and TO lines`)
    const extra = description
      .replace(/^FROM:.*$/gim, '')
      .replace(/^TO:.*$/gim, '')
      .trim()
    if (extra || mapped.background || mapped.scenarios.length)
      throw new ConversionError('RENAMED Rule contains unsupported content')
    mapped.rename = { from: from.trim(), to: to.trim() }
    mapped.description = ''
  }
  return mapped
}

export function mapMdgBackground(
  background: Background,
  lines: string[],
  siblings: LocatedChild[],
): BackgroundModel {
  const firstStep =
    background.steps[0]?.location.line ||
    nextSiblingLine(background.location.line, siblings, lines.length + 1)
  return {
    name: background.name.trim(),
    description: proseBetween(lines, background.location.line + 1, firstStep),
    steps: background.steps.map(mapMdgStep),
  }
}

export function mapMdgScenario(scenario: Scenario, lines: string[]): ScenarioModel {
  const firstContent = Math.min(
    scenario.steps[0]?.location.line || Infinity,
    scenario.examples[0] ? tagStartLine(lines, { examples: scenario.examples[0] }) : Infinity,
  )
  return {
    kind: /outline/i.test(scenario.keyword) ? 'outline' : 'scenario',
    name: scenario.name.trim(),
    description: proseBetween(
      lines,
      scenario.location.line + 1,
      Number.isFinite(firstContent) ? firstContent : lines.length + 1,
    ),
    tags: scenario.tags.map((tag) => tag.name),
    steps: scenario.steps.map(mapMdgStep),
    examples: scenario.examples.map((examples) => mapMdgExamples(examples, lines)),
  }
}

export function mapMdgExamples(examples: Examples, lines: string[]): ExamplesModel {
  const tableLine = examples.tableHeader?.location.line || lines.length + 1
  const rows = []
  if (examples.tableHeader) rows.push(examples.tableHeader.cells.map((cell) => cell.value))
  rows.push(...examples.tableBody.map((row) => row.cells.map((cell) => cell.value)))
  return {
    name: examples.name.trim(),
    description: proseBetween(lines, examples.location.line + 1, tableLine),
    tags: examples.tags.map((tag) => tag.name),
    rows,
  }
}

export function mapMdgStep(step: Step): StepModel {
  return {
    keyword: step.keyword.trim().toUpperCase(),
    text: step.text,
    table: step.dataTable
      ? step.dataTable.rows.map((row) => row.cells.map((cell) => cell.value))
      : null,
    docString: step.docString
      ? { mediaType: step.docString.mediaType || '', content: step.docString.content }
      : null,
  }
}
