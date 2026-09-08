import { DELTA_TAG, SYNTHETIC_TAG } from '../constants.js'
import type { DocumentModel, RuleModel, ScenarioModel } from '../model.js'
import { pushDescriptionAndSteps, pushTable, pushTags, trimBlank } from '../syntax.js'

export function serializeOpenSpec(model: DocumentModel): string {
  const output: string[] = []
  pushTags(output, model.tags)
  if (model.kind === 'delta') pushTags(output, [DELTA_TAG])
  output.push(`# ${model.name}`, '')
  if (model.description) output.push('## Purpose', '', model.description, '')
  if (model.kind === 'delta') serializeOpenSpecDelta(output, model)
  else serializeOpenSpecMain(output, model)
  return `${trimBlank(output).join('\n')}\n`
}

export function serializeOpenSpecMain(output: string[], model: DocumentModel): void {
  output.push('## Requirements', '')
  if (model.background) {
    output.push(`**Background:${model.background.name ? ` ${model.background.name}` : ''}**`, '')
    pushDescriptionAndSteps(output, model.background)
  }
  if (model.featureScenarios.length) {
    pushTags(output, [SYNTHETIC_TAG])
    output.push(
      '### Requirement: Feature-level scenarios',
      '',
      'The system SHALL exhibit the feature-level behavior defined by the following scenarios.',
      '',
    )
    for (const scenario of model.featureScenarios) serializeOpenSpecScenario(output, scenario)
  }
  for (const rule of model.rules) serializeOpenSpecRule(output, rule)
}

export function serializeOpenSpecDelta(output: string[], model: DocumentModel): void {
  for (const operation of new Set(model.rules.map((rule) => rule.operation))) {
    const rules = model.rules.filter((rule) => rule.operation === operation)
    if (!rules.length) continue
    output.push(`## ${operation} Requirements`, '')
    if (operation === 'RENAMED') {
      for (const rule of rules) {
        pushTags(output, rule.tags)
        output.push(
          `- FROM: \`### Requirement: ${rule.rename?.from}\``,
          `- TO: \`### Requirement: ${rule.rename?.to}\``,
          '',
        )
      }
    } else if (operation === 'REMOVED') {
      for (const rule of rules) {
        pushTags(output, rule.tags)
        output.push(`### Requirement: ${rule.name}`, '')
      }
    } else {
      for (const rule of rules) serializeOpenSpecRule(output, rule)
    }
  }
}

export function serializeOpenSpecRule(output: string[], rule: RuleModel): void {
  pushTags(output, rule.tags)
  output.push(`### Requirement: ${rule.name}`, '', rule.description, '')
  if (rule.background) {
    output.push(`#### Background: ${rule.background.name}`.trimEnd(), '')
    pushDescriptionAndSteps(output, rule.background)
  }
  for (const scenario of rule.scenarios) serializeOpenSpecScenario(output, scenario)
}

export function serializeOpenSpecScenario(output: string[], scenario: ScenarioModel): void {
  pushTags(output, scenario.tags)
  output.push(
    `#### ${scenario.kind === 'outline' ? 'Scenario Outline' : 'Scenario'}: ${scenario.name}`,
    '',
  )
  pushDescriptionAndSteps(output, scenario)
  for (const examples of scenario.examples) {
    pushTags(output, examples.tags)
    output.push(`##### Examples: ${examples.name}`, '')
    if (examples.description) output.push(examples.description, '')
    pushTable(output, examples.rows)
  }
}
