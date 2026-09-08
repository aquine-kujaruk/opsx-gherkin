import type { GherkinDocument, Rule } from '@cucumber/messages'
import { DELTA_TAG, OPERATION_TAGS } from '../constants.js'
import { ConversionError } from '../errors.js'
import type { BackgroundModel, DocumentModel, RuleModel, ScenarioModel } from '../model.js'
import { trimBlank } from '../syntax.js'
import { mapMdgStep } from './mdg.js'

type Background = NonNullable<Rule['children'][number]['background']>
type Scenario = NonNullable<Rule['children'][number]['scenario']>

function description(value: { description: string; location: { column?: number } }): string {
  const prefix = ' '.repeat((value.location.column ?? 1) + 1)
  return trimBlank(
    value.description
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : line)),
  ).join('\n')
}

function background(value: Background): BackgroundModel {
  return {
    name: value.name.trim(),
    description: description(value),
    steps: value.steps.map(mapMdgStep),
  }
}
function scenario(value: Scenario): ScenarioModel {
  return {
    ...background(value),
    kind: /outline/i.test(value.keyword) ? 'outline' : 'scenario',
    tags: value.tags.map((tag) => tag.name),
    examples: value.examples.map((group) => ({
      name: group.name.trim(),
      description: description(group),
      tags: group.tags.map((tag) => tag.name),
      rows: [
        ...(group.tableHeader ? [group.tableHeader.cells.map((cell) => cell.value)] : []),
        ...group.tableBody.map((row) => row.cells.map((cell) => cell.value)),
      ],
    })),
  }
}
export function parseFeatureModel(document: GherkinDocument): DocumentModel {
  const feature = document.feature
  if (!feature) throw new ConversionError('Gherkin document has no Feature')
  const tags = feature.tags.map((tag) => tag.name)
  const model: DocumentModel = {
    name: feature.name.trim(),
    description: description(feature),
    kind: tags.includes(DELTA_TAG) ? 'delta' : 'main',
    tags: tags.filter((tag) => tag !== DELTA_TAG),
    background: null,
    featureScenarios: [],
    rules: [],
  }
  for (const child of feature.children) {
    if (child.background) model.background = background(child.background)
    if (child.scenario) model.featureScenarios.push(scenario(child.scenario))
    if (child.rule) {
      const value = child.rule
      const tags = value.tags.map((tag) => tag.name)
      const operationTag = tags.find((tag) => OPERATION_TAGS.has(tag))
      const rule: RuleModel = {
        name: value.name.trim(),
        description: description(value),
        tags: tags.filter((tag) => !OPERATION_TAGS.has(tag)),
        operation: operationTag ? OPERATION_TAGS.get(operationTag) : undefined,
        rename: null,
        background: null,
        scenarios: [],
      }
      for (const item of value.children) {
        if (item.background) rule.background = background(item.background)
        if (item.scenario) rule.scenarios.push(scenario(item.scenario))
      }
      if (rule.operation === 'RENAMED') {
        const from = rule.description.match(/^FROM:\s*### Requirement:\s*(.+)$/m)?.[1]
        const to = rule.description.match(/^TO:\s*### Requirement:\s*(.+)$/m)?.[1]
        if (!from || !to) throw new ConversionError('RENAMED Rule requires FROM and TO')
        rule.rename = { from: from.trim(), to: to.trim() }
        rule.description = ''
      }
      model.rules.push(rule)
    }
  }
  return model
}
