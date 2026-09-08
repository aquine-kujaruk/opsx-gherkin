import { DELTA_TAG, OPERATION_TAGS } from '../constants.js'
import type {
  BackgroundModel,
  DocumentModel,
  RuleModel,
  ScenarioModel,
  StepModel,
} from '../model.js'
import { escapeCell, titleCase, trimBlank } from '../syntax.js'

export function serializeFeature(model: DocumentModel): string {
  const output: string[] = []
  const featureTags = model.kind === 'delta' ? [...model.tags, DELTA_TAG] : model.tags
  pushFeatureTags(output, featureTags, 0)
  output.push(`Feature: ${model.name}`)
  pushFeatureDescription(output, model.description, 2)
  if (model.background) serializeFeatureBackground(output, model.background, 2)
  for (const scenario of model.featureScenarios) serializeFeatureScenario(output, scenario, 2)
  for (const rule of model.rules) serializeFeatureRule(output, rule)
  return `${trimBlank(output).join('\n')}\n`
}

export function serializeFeatureRule(output: string[], rule: RuleModel): void {
  const operationTag = rule.operation
    ? [...OPERATION_TAGS].find(([, operation]) => operation === rule.operation)?.[0]
    : null
  output.push('')
  pushFeatureTags(output, [...rule.tags, ...(operationTag ? [operationTag] : [])], 2)
  output.push(`  Rule: ${rule.operation === 'RENAMED' ? 'Rename requirement' : rule.name}`)
  if (rule.operation === 'RENAMED') {
    pushFeatureDescription(
      output,
      `FROM: ### Requirement: ${rule.rename?.from}\nTO: ### Requirement: ${rule.rename?.to}`,
      4,
    )
    return
  }
  pushFeatureDescription(output, rule.description, 4)
  if (rule.background) serializeFeatureBackground(output, rule.background, 4)
  for (const scenario of rule.scenarios) serializeFeatureScenario(output, scenario, 4)
}

export function serializeFeatureBackground(
  output: string[],
  background: BackgroundModel,
  indent: number,
): void {
  output.push('', `${' '.repeat(indent)}Background:${background.name ? ` ${background.name}` : ''}`)
  pushFeatureDescription(output, background.description, indent + 2)
  pushFeatureSteps(output, background.steps, indent + 2)
}

export function serializeFeatureScenario(
  output: string[],
  scenario: ScenarioModel,
  indent: number,
): void {
  output.push('')
  pushFeatureTags(output, scenario.tags, indent)
  output.push(
    `${' '.repeat(indent)}${scenario.kind === 'outline' ? 'Scenario Outline' : 'Scenario'}: ${scenario.name}`,
  )
  pushFeatureDescription(output, scenario.description, indent + 2)
  pushFeatureSteps(output, scenario.steps, indent + 2)
  for (const examples of scenario.examples) {
    output.push('')
    pushFeatureTags(output, examples.tags, indent + 2)
    output.push(`${' '.repeat(indent + 2)}Examples: ${examples.name}`)
    pushFeatureDescription(output, examples.description, indent + 4)
    pushFeatureTable(output, examples.rows, indent + 4)
  }
}

export function pushFeatureSteps(output: string[], steps: StepModel[], indent: number): void {
  const prefix = ' '.repeat(indent)
  for (const step of steps) {
    output.push(`${prefix}${titleCase(step.keyword)} ${step.text}`)
    if (step.table) pushFeatureTable(output, step.table, indent + 2)
    if (step.docString) {
      const fence = step.docString.content.split('\n').some((line) => line.trim() === '"""')
        ? '```'
        : '"""'
      output.push(`${' '.repeat(indent + 2)}${fence}${step.docString.mediaType || ''}`)
      for (const line of step.docString.content.split('\n'))
        output.push(`${' '.repeat(indent + 2)}${line}`)
      output.push(`${' '.repeat(indent + 2)}${fence}`)
    }
  }
}

export function pushFeatureTable(output: string[], rows: string[][], indent: number): void {
  if (!rows?.length) return
  const prefix = ' '.repeat(indent)
  for (const row of rows) output.push(`${prefix}| ${row.map(escapeCell).join(' | ')} |`)
}

export function pushFeatureDescription(
  output: string[],
  description: string,
  indent: number,
): void {
  if (!description) return
  const prefix = ' '.repeat(indent)
  output.push('')
  for (const line of description.split('\n')) output.push(line ? `${prefix}${line}` : '')
}

export function pushFeatureTags(output: string[], tags: string[], indent: number): void {
  if (tags?.length) output.push(`${' '.repeat(indent)}${tags.join(' ')}`)
}
