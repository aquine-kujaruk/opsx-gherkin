import { isDeepStrictEqual } from 'node:util'
import { ConversionError } from './errors.js'

export type DocumentKind = 'main' | 'delta'
export type Operation = 'ADDED' | 'MODIFIED' | 'REMOVED' | 'RENAMED'
export type Direction = 'mdg-to-opsx' | 'opsx-to-mdg' | 'opsx-to-feature'
export interface ConversionOptions {
  sourcePath?: string
  name?: string
  projectRoot?: string
}
export interface StepModel {
  keyword: string
  text: string
  table: string[][] | null
  docString: { mediaType: string; content: string } | null
}
export interface BackgroundModel {
  name: string
  description: string
  steps: StepModel[]
}
export interface ExamplesModel {
  name: string
  description: string
  tags: string[]
  rows: string[][]
}
export interface ScenarioModel extends BackgroundModel {
  kind: 'scenario' | 'outline'
  tags: string[]
  examples: ExamplesModel[]
}
export interface RuleModel {
  name: string
  description: string
  tags: string[]
  operation: Operation | undefined
  rename: { from: string; to: string } | null
  background: BackgroundModel | null
  scenarios: ScenarioModel[]
}
export interface DocumentModel {
  kind: DocumentKind
  name: string
  description: string
  tags: string[]
  background: BackgroundModel | null
  featureScenarios: ScenarioModel[]
  rules: RuleModel[]
}

/** Rename Rules are structural wrappers; their FROM and TO names carry the identity. */
export function normalizedModel(model: DocumentModel): DocumentModel {
  return {
    ...model,
    rules: model.rules.map((rule) => ({
      ...rule,
      name: rule.operation === 'RENAMED' ? 'Rename requirement' : rule.name,
    })),
  }
}

export function assertPreserved(source: DocumentModel, destination: DocumentModel): void {
  if (!isDeepStrictEqual(normalizedModel(source), normalizedModel(destination))) {
    throw new ConversionError('Conversion would change the normalized document model', [
      'The destination was not emitted. Check supported structure, ordering, and literal values.',
    ])
  }
}
