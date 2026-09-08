import { DELTA_TAG, OPERATION_TAGS } from '../constants.js'
import type { BackgroundModel, DocumentModel, RuleModel, ScenarioModel } from '../model.js'
import { pushDescriptionAndSteps, pushTable, pushTags, trimBlank } from '../syntax.js'

export function serializeMdg(model: DocumentModel): string {
  const output: string[] = []
  const featureTags = model.kind === 'delta' ? [...model.tags, DELTA_TAG] : model.tags
  pushTags(output, featureTags)
  output.push(`# Feature: ${model.name}`, '')
  if (model.description) output.push(model.description, '')
  if (model.background) serializeMdgBackground(output, model.background, 2)
  for (const scenario of model.featureScenarios) serializeMdgScenario(output, scenario, 3)
  for (const rule of model.rules) serializeMdgRule(output, rule)
  return `${trimBlank(output).join('\n')}\n`
}

export function serializeMdgRule(output: string[], rule: RuleModel): void {
  const operationTag = rule.operation
    ? [...OPERATION_TAGS].find(([, operation]) => operation === rule.operation)?.[0]
    : null
  pushTags(output, [...rule.tags, ...(operationTag ? [operationTag] : [])])
  output.push(`## Rule: ${rule.operation === 'RENAMED' ? 'Rename requirement' : rule.name}`, '')
  if (rule.operation === 'RENAMED') {
    output.push(
      `FROM: \`### Requirement: ${rule.rename?.from}\``,
      `TO: \`### Requirement: ${rule.rename?.to}\``,
      '',
    )
    return
  }
  if (rule.description) output.push(rule.description, '')
  if (rule.background) serializeMdgBackground(output, rule.background, 3)
  for (const scenario of rule.scenarios) serializeMdgScenario(output, scenario, 3)
}

export function serializeMdgBackground(
  output: string[],
  background: BackgroundModel,
  level: number,
): void {
  output.push(`${'#'.repeat(level)} Background:${background.name ? ` ${background.name}` : ''}`, '')
  pushDescriptionAndSteps(output, background, true)
}

export function serializeMdgScenario(
  output: string[],
  scenario: ScenarioModel,
  level: number,
): void {
  pushTags(output, scenario.tags)
  output.push(
    `${'#'.repeat(level)} ${scenario.kind === 'outline' ? 'Scenario Outline' : 'Scenario'}: ${scenario.name}`,
    '',
  )
  pushDescriptionAndSteps(output, scenario, true)
  for (const examples of scenario.examples) {
    pushTags(output, examples.tags)
    output.push(`${'#'.repeat(level + 1)} Examples: ${examples.name}`, '')
    if (examples.description) output.push(examples.description, '')
    pushTable(output, examples.rows, true, false)
  }
}
