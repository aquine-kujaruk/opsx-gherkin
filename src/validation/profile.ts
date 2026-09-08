import { RESERVED_PREFIXES } from '../constants.js'
import { ConversionError } from '../errors.js'
import type { DocumentModel } from '../model.js'

export function validateProfile(model: DocumentModel, sourceKind: string): void {
  if (!model.name) throw new ConversionError('Feature/spec name is required')
  if (!model.description && model.kind === 'main')
    throw new ConversionError('Feature Purpose/description is required')
  const allTags = [
    ...model.tags,
    ...model.rules.flatMap((rule) => [
      ...rule.tags,
      ...rule.scenarios.flatMap((scenario) => [
        ...scenario.tags,
        ...scenario.examples.flatMap((examples) => examples.tags),
      ]),
    ]),
    ...model.featureScenarios.flatMap((scenario) => scenario.tags),
  ]
  for (const tag of allTags) {
    if (RESERVED_PREFIXES.some((prefix) => tag.startsWith(prefix))) {
      throw new ConversionError(`Reserved tag is not allowed as user metadata: ${tag}`)
    }
  }
  if (model.kind === 'main') {
    if (!model.rules.length && !model.featureScenarios.length)
      throw new ConversionError('Feature has no behavior to convert')
    for (const rule of model.rules) {
      if (!/\b(?:SHALL|MUST)\b/.test(rule.description)) {
        throw new ConversionError(`Rule/Requirement "${rule.name}" must contain SHALL or MUST`)
      }
      if (!rule.scenarios.length && !rule.background) {
        throw new ConversionError(`Rule/Requirement "${rule.name}" has no scenarios or Background`)
      }
    }
  } else {
    if (model.background || model.featureScenarios.length)
      throw new ConversionError(
        'Delta Features cannot contain feature-level Background or scenarios',
      )
    for (const rule of model.rules) {
      if (
        (rule.operation === 'ADDED' || rule.operation === 'MODIFIED') &&
        !/\b(?:SHALL|MUST)\b/.test(rule.description)
      ) {
        throw new ConversionError(
          `${rule.operation} Rule "${rule.name}" must contain SHALL or MUST`,
        )
      }
      if (
        (rule.operation === 'ADDED' || rule.operation === 'MODIFIED') &&
        !rule.scenarios.length &&
        !rule.background
      ) {
        throw new ConversionError(`${rule.operation} Rule "${rule.name}" requires behavior`)
      }
      if (
        rule.operation === 'REMOVED' &&
        (rule.description || rule.scenarios.length || rule.background)
      ) {
        throw new ConversionError(`REMOVED Rule "${rule.name}" must contain only its name`)
      }
      if (rule.operation === 'RENAMED' && !rule.rename)
        throw new ConversionError('RENAMED Rule requires FROM and TO')
    }
  }
  for (const scenario of [
    ...model.featureScenarios,
    ...model.rules.flatMap((rule) => rule.scenarios),
  ]) {
    if (!scenario.steps.length)
      throw new ConversionError(`Scenario "${scenario.name}" has no steps`)
    if (scenario.kind === 'outline' && !scenario.examples.length)
      throw new ConversionError(`Scenario Outline "${scenario.name}" has no Examples`)
    if (scenario.kind === 'scenario' && scenario.examples.length)
      throw new ConversionError(`Scenario "${scenario.name}" cannot contain Examples`)
  }
  if (sourceKind === 'openspec' && model.kind === 'delta' && !model.rules.length) {
    throw new ConversionError('Delta has no operations')
  }
}
