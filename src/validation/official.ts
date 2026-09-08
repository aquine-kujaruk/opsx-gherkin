import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateMessages } from '@cucumber/gherkin'
import { IdGenerator, SourceMediaType } from '@cucumber/messages'
import type { DocumentKind } from '../model.js'

export interface ValidationIssue {
  message: string
  level: string
  path?: string
  line?: number
}
export interface ValidationReport {
  valid: boolean
  issues: ValidationIssue[]
}
interface OpenSpecValidator {
  validateSpecContent(name: string, text: string): Promise<ValidationReport>
  validateSpec(path: string): Promise<ValidationReport>
  validateChangeDeltaSpecs(
    path: string,
    options: { mainSpecsDir?: string },
  ): Promise<ValidationReport>
}
type ValidatorConstructor = new (strict: boolean) => OpenSpecValidator
let validatorClass: ValidatorConstructor | undefined

async function validator(): Promise<OpenSpecValidator> {
  if (!validatorClass) {
    const entry = import.meta.resolve('@fission-ai/openspec')
    const module = await import(new URL('./core/validation/validator.js', entry).href)
    validatorClass = module.Validator as ValidatorConstructor
  }
  return new validatorClass(true)
}

export async function validateOpenSpec(
  text: string,
  { kind, name = 'spec', projectRoot }: { kind: DocumentKind; name?: string; projectRoot?: string },
): Promise<ValidationReport> {
  const instance = await validator()
  if (kind === 'main') return instance.validateSpecContent(name, text)
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'opsx-gherkin-'))
  try {
    const changeDir = join(temporaryRoot, 'change')
    // A capability name may be nested, but may never escape the private change directory.
    if (name.split(/[\\/]/).some((part) => part === '..' || part === '.')) {
      return { valid: false, issues: [{ level: 'ERROR', message: 'Invalid capability name' }] }
    }
    const specDir = join(changeDir, 'specs', ...name.split('/'))
    await mkdir(specDir, { recursive: true })
    await writeFile(join(specDir, 'spec.md'), text, 'utf8')
    return await instance.validateChangeDeltaSpecs(
      changeDir,
      projectRoot ? { mainSpecsDir: join(projectRoot, 'openspec', 'specs') } : {},
    )
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
}

export async function validateOpenSpecFile(path: string): Promise<ValidationReport> {
  return (await validator()).validateSpec(path)
}

export function parseAndValidateMdg(text: string, uri = 'memory.feature.md') {
  return parseGherkin(text, uri, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_MARKDOWN)
}
export function parseAndValidateFeature(text: string, uri = 'memory.feature') {
  return parseGherkin(text, uri, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN)
}
function parseGherkin(text: string, uri: string, mediaType: SourceMediaType) {
  const envelopes = generateMessages(text, uri, mediaType, {
    defaultDialect: 'en',
    includeSource: false,
    includeGherkinDocument: true,
    includePickles: true,
    newId: IdGenerator.incrementing(),
  })
  const errors = envelopes.flatMap((envelope) => (envelope.parseError ? [envelope.parseError] : []))
  const document = envelopes.find((envelope) => envelope.gherkinDocument)?.gherkinDocument
  const pickles = envelopes.flatMap((envelope) => (envelope.pickle ? [envelope.pickle] : []))
  return { valid: errors.length === 0 && Boolean(document?.feature), errors, document, pickles }
}

export function openSpecDiagnostics(report: ValidationReport): string[] {
  return report.issues.map(
    (issue) => `${issue.line ? `line ${issue.line}` : issue.path || 'document'}: ${issue.message}`,
  )
}
export function gherkinDiagnostics(report: ReturnType<typeof parseAndValidateMdg>): string[] {
  return report.errors.map(
    (issue) =>
      `line ${issue.source.location?.line ?? 1}:${issue.source.location?.column ?? 1}: ${issue.message}`,
  )
}
