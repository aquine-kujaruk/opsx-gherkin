import { ConversionError } from './errors.js'
import type { ConversionOptions } from './model.js'
import { assertPreserved } from './model.js'
import { parseFeatureModel } from './parsers/feature.js'
import { parseMdgModel } from './parsers/mdg.js'
import { detectOpenSpecKind, parseOpenSpecModel } from './parsers/openspec.js'
import { serializeFeature } from './renderers/feature.js'
import { serializeMdg } from './renderers/mdg.js'
import { serializeOpenSpec } from './renderers/openspec.js'
import { resolveOpenSpecName, slugify } from './syntax.js'
import {
  gherkinDiagnostics,
  openSpecDiagnostics,
  parseAndValidateFeature,
  parseAndValidateMdg,
  validateOpenSpec,
} from './validation/official.js'
import { validateProfile } from './validation/profile.js'

export async function mdgToOpsx(text: string, options: ConversionOptions = {}): Promise<string> {
  const source = parseAndValidateMdg(text, options.sourcePath)
  if (!source.valid || !source.document)
    throw new ConversionError('Invalid Markdown with Gherkin input', gherkinDiagnostics(source))
  const model = parseMdgModel(text, source.document)
  validateProfile(model, 'mdg')
  const output = serializeOpenSpec(model)
  const name = options.name || slugify(model.name)
  const report = await validateOpenSpec(output, {
    kind: model.kind,
    name,
    projectRoot: options.projectRoot,
  })
  if (!report.valid)
    throw new ConversionError(
      'Generated OpenSpec failed official validation',
      openSpecDiagnostics(report),
    )
  assertPreserved(model, parseOpenSpecModel(output, { kind: model.kind, name }))
  return output
}

async function openSpecModel(text: string, options: ConversionOptions) {
  const kind = detectOpenSpecKind(text)
  const name = resolveOpenSpecName(text, options)
  const report = await validateOpenSpec(text, { kind, name, projectRoot: options.projectRoot })
  if (!report.valid)
    throw new ConversionError('Invalid OpenSpec input', openSpecDiagnostics(report))
  const model = parseOpenSpecModel(text, { kind, name })
  validateProfile(model, 'openspec')
  return model
}

export async function opsxToMdg(text: string, options: ConversionOptions = {}): Promise<string> {
  const model = await openSpecModel(text, options)
  const output = serializeMdg(model)
  const target = parseAndValidateMdg(output)
  if (!target.valid || !target.document)
    throw new ConversionError(
      'Generated Markdown with Gherkin failed official validation',
      gherkinDiagnostics(target),
    )
  assertPreserved(model, parseMdgModel(output, target.document))
  return output
}

export async function opsxToFeature(
  text: string,
  options: ConversionOptions = {},
): Promise<string> {
  const model = await openSpecModel(text, options)
  const output = serializeFeature(model)
  const target = parseAndValidateFeature(output)
  if (!target.valid || !target.document)
    throw new ConversionError(
      'Generated Gherkin feature failed official validation',
      gherkinDiagnostics(target),
    )
  assertPreserved(model, parseFeatureModel(target.document))
  return output
}
