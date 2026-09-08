import { basename, dirname } from 'node:path'
import { ConversionError } from './errors.js'
import type { ConversionOptions, StepModel } from './model.js'

export interface Heading {
  index: number
  title: string
}
export interface Section {
  start: number
  end: number
}
export type Located = { location: { line: number } }
export type LocatedChild =
  | Located
  | { background?: Located; scenario?: Located; rule?: Located; examples?: Located }

export function pushDescriptionAndSteps(
  output: string[],
  node: { description: string; steps: StepModel[] },
  mdg = false,
): void {
  if (node.description) output.push(node.description, '')
  for (const step of node.steps) {
    const keyword = mdg ? titleCase(step.keyword) : `**${step.keyword}**`
    output.push(`${mdg ? '*' : '-'} ${keyword} ${step.text}`)
    if (step.table) pushTable(output, step.table, false, !mdg)
    if (step.docString) {
      output.push('', `  \`\`\`${step.docString.mediaType || ''}`)
      for (const line of step.docString.content.split('\n')) output.push(`  ${line}`)
      output.push('  ```')
    }
  }
  output.push('')
}

export function pushTable(
  output: string[],
  rows: string[][],
  blankAfter = true,
  separator = true,
): void {
  if (!rows?.length) return
  output.push(`  | ${rows[0].map(escapeCell).join(' | ')} |`)
  if (separator) output.push(`  | ${rows[0].map(() => '---').join(' | ')} |`)
  for (const row of rows.slice(1)) output.push(`  | ${row.map(escapeCell).join(' | ')} |`)
  if (blankAfter) output.push('')
}

export function parseTable(lines: string[]): string[][] {
  const rows = lines.filter((line) => /^\s{2,}\|/.test(line)).map(parseTableRow)
  if (rows.length >= 2 && rows[1].every((cell) => /^:?-+:?$/.test(cell))) rows.splice(1, 1)
  if (!rows.length) throw new ConversionError('Empty table')
  const width = rows[0].length
  if (rows.some((row) => row.length !== width))
    throw new ConversionError('Inconsistent table column count')
  return rows
}

export function parseTableRow(line: string): string[] {
  const content = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells = []
  let cell = ''
  let escaped = false
  for (const char of content) {
    if (escaped) {
      cell += char === 'n' ? '\n' : char
      escaped = false
    } else if (char === '\\') escaped = true
    else if (char === '|') {
      cells.push(cell.trim())
      cell = ''
    } else cell += char
  }
  cells.push(cell.trim())
  return cells
}

export function normalizeLines(text: string): string[] {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
}

export function fenceMask(lines: string[]): boolean[] {
  const mask = []
  let fence: string | null = null
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*(`{3,}|~{3,})/)
    mask[index] = Boolean(fence)
    if (match && !fence) {
      fence = match[1][0]
      mask[index] = true
    } else if (match && fence === match[1][0]) {
      mask[index] = true
      fence = null
    }
  }
  return mask
}

export function findHeading(lines: string[], mask: boolean[], level: number): Heading | null {
  for (let index = 0; index < lines.length; index += 1) {
    const match = !mask[index] && lines[index].match(new RegExp(`^#{${level}}\\s+(.+?)\\s*$`))
    if (match) return { index, title: match[1].trim() }
  }
  return null
}

export function headingsInRange(
  lines: string[],
  mask: boolean[],
  level: number,
  start: number,
  end: number,
): Heading[] {
  const result = []
  for (let index = start; index < end; index += 1) {
    const match = !mask[index] && lines[index].match(new RegExp(`^#{${level}}\\s+(.+?)\\s*$`))
    if (match) result.push({ index, title: match[1].trim() })
  }
  return result
}

export function findSection(lines: string[], mask: boolean[], title: string): Section {
  const section = findSectionOptional(lines, mask, title)
  if (!section) throw new ConversionError(`Missing OpenSpec section: ## ${title}`)
  return section
}

export function findSectionOptional(
  lines: string[],
  mask: boolean[],
  title: string,
): Section | null {
  for (let index = 0; index < lines.length; index += 1) {
    if (!mask[index] && new RegExp(`^##\\s+${escapeRegex(title)}\\s*$`, 'i').test(lines[index])) {
      let end = lines.length
      for (let next = index + 1; next < lines.length; next += 1) {
        if (!mask[next] && /^##\s+/.test(lines[next])) {
          end = next
          break
        }
      }
      return { start: index, end }
    }
  }
  return null
}

export function sectionContent(lines: string[], mask: boolean[], title: string): string | null {
  const section = findSectionOptional(lines, mask, title)
  return section ? trimBlank(lines.slice(section.start + 1, section.end)).join('\n') : null
}

export function precedingTags(lines: string[], headingIndex: number): string[] {
  let index = headingIndex - 1
  while (index >= 0 && !lines[index].trim()) index -= 1
  const blocks = []
  while (index >= 0 && isTagLine(lines[index])) {
    blocks.unshift(...extractTags(lines[index]))
    index -= 1
    while (index >= 0 && !lines[index].trim()) index -= 1
  }
  return blocks
}

export function tagBlockStart(lines: string[], headingIndex: number): number {
  let index = headingIndex - 1
  while (index >= 0 && !lines[index].trim()) index -= 1
  while (index >= 0 && isTagLine(lines[index])) {
    index -= 1
    while (index >= 0 && !lines[index].trim()) index -= 1
  }
  return index + 1
}

export function tagStartLine(lines: string[], node: LocatedChild): number {
  return tagBlockStart(lines, nodeLine(node) - 1) + 1
}

export function isTagLine(line: string): boolean {
  const matches = [...line.matchAll(/`(@[^`]+)`/g)]
  return matches.length > 0 && line.replace(/`(@[^`]+)`/g, '').trim() === ''
}

export function extractTags(line: string): string[] {
  return [...line.matchAll(/`(@[^`]+)`/g)].map((match) => match[1])
}

export function proseBetween(lines: string[], startLine: number, endLine: number): string {
  const slice = lines.slice(Math.max(0, startLine - 1), Math.max(0, endLine - 1))
  while (slice.length && (!slice[slice.length - 1].trim() || isTagLine(slice[slice.length - 1])))
    slice.pop()
  return trimBlank(slice).join('\n')
}

export function nextSiblingLine(line: number, siblings: LocatedChild[], fallback: number): number {
  return (
    siblings
      .map(nodeLine)
      .filter((candidate) => candidate > line)
      .sort((a, b) => a - b)[0] || fallback
  )
}

export function nodeLine(child: LocatedChild): number {
  if ('location' in child) return child.location.line
  const value = child.background ?? child.scenario ?? child.rule ?? child.examples
  if (!value) throw new ConversionError('Missing Gherkin node location')
  return value.location.line
}

export function trimBlank(lines: string[]): string[] {
  const copy = [...lines]
  while (copy.length && !copy[0].trim()) copy.shift()
  while (copy.length && !copy[copy.length - 1].trim()) copy.pop()
  return copy
}

export function pushTags(output: string[], tags: string[]): void {
  if (tags?.length) output.push(tags.map((tag) => `\`${tag}\``).join(' '))
}

export function resolveOpenSpecName(text: string, options: ConversionOptions): string {
  const lines = normalizeLines(text)
  const mask = fenceMask(lines)
  const h1 = findHeading(lines, mask, 1)
  if (h1) return h1.title.replace(/^Feature:\s*/i, '').trim()
  if (options.name) return options.name
  if (options.sourcePath) {
    const parent = basename(dirname(options.sourcePath))
    if (parent && parent !== '.') return parent
  }
  throw new ConversionError('OpenSpec text without an H1 title requires --name')
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'spec'
  )
}

export function titleCase(keyword: string): string {
  return keyword[0] + keyword.slice(1).toLowerCase()
}

export function escapeCell(value: string): string {
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, '\\n')
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
