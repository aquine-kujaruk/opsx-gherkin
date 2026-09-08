import { DELTA_TAG, SYNTHETIC_TAG } from '../constants.js'
import { ConversionError } from '../errors.js'
import type {
  BackgroundModel,
  DocumentKind,
  DocumentModel,
  Operation,
  RuleModel,
  ScenarioModel,
  StepModel,
} from '../model.js'
import type { Heading } from '../syntax.js'
import {
  fenceMask,
  findHeading,
  findSection,
  findSectionOptional,
  headingsInRange,
  normalizeLines,
  parseTable,
  precedingTags,
  sectionContent,
  tagBlockStart,
  trimBlank,
} from '../syntax.js'

export function detectOpenSpecKind(text: string): DocumentKind {
  const lines = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
  const mask = fenceMask(lines)
  const main = lines.some((line, index) => !mask[index] && /^##\s+Requirements\s*$/i.test(line))
  const delta = lines.some(
    (line, index) =>
      !mask[index] && /^##\s+(ADDED|MODIFIED|REMOVED|RENAMED) Requirements\s*$/i.test(line),
  )
  if (main && delta)
    throw new ConversionError('OpenSpec input mixes main and delta requirement sections')
  if (!main && !delta)
    throw new ConversionError('OpenSpec input has no Requirements or delta sections')
  return delta ? 'delta' : 'main'
}

export function parseOpenSpecModel(
  text: string,
  { kind, name }: { kind: DocumentKind; name: string },
): DocumentModel {
  const lines = normalizeLines(text)
  const mask = fenceMask(lines)
  const h1 = findHeading(lines, mask, 1)
  const title = h1 ? h1.title : name
  const tags = h1 ? precedingTags(lines, h1.index) : []
  const purpose = sectionContent(lines, mask, 'Purpose')
  const model: DocumentModel = {
    kind,
    name: title,
    description: purpose?.trim() || '',
    tags: tags.filter((tag) => tag !== DELTA_TAG),
    background: null,
    featureScenarios: [],
    rules: [],
  }

  if (kind === 'main') parseMainOpenSpec(lines, mask, model)
  else parseDeltaOpenSpec(lines, mask, model)
  return model
}

export function parseMainOpenSpec(lines: string[], mask: boolean[], model: DocumentModel): void {
  const section = findSection(lines, mask, 'Requirements')
  const requirements = headingsInRange(lines, mask, 3, section.start + 1, section.end).filter(
    (heading) => /^Requirement:\s*/i.test(heading.title),
  )
  const firstRequirementStart = requirements[0]
    ? tagBlockStart(lines, requirements[0].index)
    : section.end
  const preamble = trimBlank(lines.slice(section.start + 1, firstRequirementStart))
  if (preamble.length) model.background = parseOpenSpecBackground(preamble, 'feature')

  for (let index = 0; index < requirements.length; index += 1) {
    const heading = requirements[index]
    const end =
      index + 1 < requirements.length
        ? tagBlockStart(lines, requirements[index + 1].index)
        : section.end
    const rule = parseOpenSpecRequirement(lines, mask, heading, end)
    if (rule.tags.includes(SYNTHETIC_TAG)) {
      rule.tags = rule.tags.filter((tag) => tag !== SYNTHETIC_TAG)
      if (rule.background && !model.background) model.background = rule.background
      model.featureScenarios.push(...rule.scenarios)
    } else {
      model.rules.push(rule)
    }
  }
}

export function parseDeltaOpenSpec(lines: string[], mask: boolean[], model: DocumentModel): void {
  model.tags = model.tags.filter((tag) => tag !== DELTA_TAG)
  const operations = headingsInRange(lines, mask, 2, 0, lines.length).flatMap((heading) => {
    const match = heading.title.match(/^(ADDED|MODIFIED|REMOVED|RENAMED) Requirements$/i)
    return match ? [match[1].toUpperCase() as Operation] : []
  })
  if (new Set(operations).size !== operations.length)
    throw new ConversionError('Repeated delta operation section is unsupported')
  for (const operation of operations) {
    const section = findSectionOptional(lines, mask, `${operation} Requirements`)
    if (!section) continue
    if (operation === 'RENAMED') {
      for (let index = section.start + 1; index < section.end; index += 1) {
        const from = lines[index].match(/^\s*-?\s*FROM:\s*`?### Requirement:\s*(.+?)`?\s*$/i)
        if (!from) continue
        let toIndex = index + 1
        while (toIndex < section.end && !lines[toIndex].trim()) toIndex += 1
        const to = lines[toIndex]?.match(/^\s*-?\s*TO:\s*`?### Requirement:\s*(.+?)`?\s*$/i)
        if (!to) throw new ConversionError(`RENAMED entry for "${from[1].trim()}" has no TO line`)
        model.rules.push({
          name: 'Rename requirement',
          description: '',
          tags: precedingTags(lines, index),
          operation,
          rename: { from: from[1].trim(), to: to[1].trim() },
          background: null,
          scenarios: [],
        })
        index = toIndex
      }
      continue
    }
    const headings = headingsInRange(lines, mask, 3, section.start + 1, section.end).filter(
      (heading) => /^Requirement:\s*/i.test(heading.title),
    )
    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index]
      const end =
        index + 1 < headings.length ? tagBlockStart(lines, headings[index + 1].index) : section.end
      const rule = parseOpenSpecRequirement(lines, mask, heading, end)
      rule.operation = operation
      model.rules.push(rule)
    }
  }
}

export function parseOpenSpecRequirement(
  lines: string[],
  mask: boolean[],
  heading: Heading,
  end: number,
): RuleModel {
  const childHeadings = headingsInRange(lines, mask, 4, heading.index + 1, end).filter((item) =>
    /^(Scenario(?: Outline)?|Background):/i.test(item.title),
  )
  const firstChild = childHeadings[0] ? tagBlockStart(lines, childHeadings[0].index) : end
  const headerBody = trimBlank(lines.slice(heading.index + 1, firstChild))
  let background = null
  let descriptionLines = headerBody
  const marker = headerBody.findIndex((line) => /^\*\*Background:/i.test(line))
  if (marker >= 0) {
    descriptionLines = trimBlank(headerBody.slice(0, marker))
    background = parseOpenSpecBackground(headerBody.slice(marker), 'rule')
  }
  const rule: RuleModel = {
    name: heading.title.replace(/^Requirement:\s*/i, '').trim(),
    description: descriptionLines.join('\n').trim(),
    tags: precedingTags(lines, heading.index),
    operation: undefined,
    rename: null,
    background,
    scenarios: [],
  }
  for (let index = 0; index < childHeadings.length; index += 1) {
    const child = childHeadings[index]
    const childEnd =
      index + 1 < childHeadings.length ? tagBlockStart(lines, childHeadings[index + 1].index) : end
    if (/^Background:/i.test(child.title))
      rule.background = parseOpenSpecScenario(lines, mask, child, childEnd, true)
    else
      rule.scenarios.push(
        parseOpenSpecScenario(lines, mask, child, childEnd, false) as ScenarioModel,
      )
  }
  return rule
}

export function parseOpenSpecBackground(lines: string[], scope: string): BackgroundModel {
  const marker = lines[0]?.match(/^\*\*Background:(.*?)\*\*\s*$/i)
  if (!marker)
    throw new ConversionError(
      `Unsupported ${scope} Requirements preamble; expected **Background:**`,
    )
  const parsed = parseOpenSpecBody(lines.slice(1))
  return { name: marker[1].trim(), description: parsed.description, steps: parsed.steps }
}

export function parseOpenSpecScenario(
  lines: string[],
  mask: boolean[],
  heading: Heading,
  end: number,
  background: boolean,
): ScenarioModel | BackgroundModel {
  const examplesHeadings = headingsInRange(lines, mask, 5, heading.index + 1, end).filter((item) =>
    /^Examples:/i.test(item.title),
  )
  const bodyEnd = examplesHeadings[0] ? tagBlockStart(lines, examplesHeadings[0].index) : end
  const body = parseOpenSpecBody(lines.slice(heading.index + 1, bodyEnd))
  if (background)
    return {
      name: heading.title.replace(/^Background:\s*/i, '').trim(),
      description: body.description,
      steps: body.steps,
    }
  const scenario: ScenarioModel = {
    kind: /^Scenario Outline:/i.test(heading.title) ? 'outline' : 'scenario',
    name: heading.title.replace(/^Scenario(?: Outline)?:\s*/i, '').trim(),
    description: body.description,
    tags: precedingTags(lines, heading.index),
    steps: body.steps,
    examples: [],
  }
  for (let index = 0; index < examplesHeadings.length; index += 1) {
    const example = examplesHeadings[index]
    const exampleEnd =
      index + 1 < examplesHeadings.length
        ? tagBlockStart(lines, examplesHeadings[index + 1].index)
        : end
    const exampleLines = trimBlank(lines.slice(example.index + 1, exampleEnd))
    const tableIndex = exampleLines.findIndex((line) => /^\s{2,}\|/.test(line))
    if (tableIndex < 0) throw new ConversionError(`Examples "${example.title}" has no table`)
    scenario.examples.push({
      name: example.title.replace(/^Examples:\s*/i, '').trim(),
      description: trimBlank(exampleLines.slice(0, tableIndex)).join('\n'),
      tags: precedingTags(lines, example.index),
      rows: parseTable(exampleLines.slice(tableIndex)),
    })
  }
  return scenario
}

export function parseOpenSpecBody(rawLines: string[]): { description: string; steps: StepModel[] } {
  const lines = trimBlank(rawLines)
  const firstStep = lines.findIndex((line) =>
    /^\s*[-*+]\s+\*\*(GIVEN|WHEN|THEN|AND|BUT)\*\*/i.test(line),
  )
  const description =
    firstStep < 0 ? lines.join('\n').trim() : trimBlank(lines.slice(0, firstStep)).join('\n')
  const steps: StepModel[] = []
  if (firstStep < 0) return { description, steps }
  let index = firstStep
  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1
      continue
    }
    const match = lines[index].match(/^\s*[-*+]\s+\*\*(GIVEN|WHEN|THEN|AND|BUT)\*\*\s+(.+)$/i)
    if (!match) throw new ConversionError(`Unsupported OpenSpec scenario line: ${lines[index]}`)
    const step: StepModel = {
      keyword: match[1].toUpperCase(),
      text: match[2],
      table: null,
      docString: null,
    }
    index += 1
    while (index < lines.length && !lines[index].trim()) index += 1
    if (index < lines.length && /^\s*```/.test(lines[index])) {
      const opener = /^(\s*)```(.*)$/.exec(lines[index])
      if (!opener) throw new ConversionError('Invalid DocString opener')
      const indent = opener[1].length
      const content = []
      index += 1
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        content.push(lines[index].slice(Math.min(indent, lines[index].length)))
        index += 1
      }
      if (index >= lines.length) throw new ConversionError('Unclosed OpenSpec DocString')
      index += 1
      step.docString = { mediaType: opener[2].trim(), content: content.join('\n') }
    } else if (index < lines.length && /^\s{2,}\|/.test(lines[index])) {
      const tableLines = []
      while (index < lines.length && /^\s{2,}\|/.test(lines[index])) tableLines.push(lines[index++])
      step.table = parseTable(tableLines)
    }
    steps.push(step)
  }
  return { description, steps }
}
