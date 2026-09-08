import type { Operation } from './model.js'

export const OPERATION_TAGS = new Map<string, Operation>([
  ['@openspec-added', 'ADDED'],
  ['@openspec-modified', 'MODIFIED'],
  ['@openspec-removed', 'REMOVED'],
  ['@openspec-renamed', 'RENAMED'],
])
export const RESERVED_PREFIXES = ['@openspec-', '@mdg-']
export const SYNTHETIC_TAG = '@mdg-feature-scenarios'
export const DELTA_TAG = '@openspec-delta'
