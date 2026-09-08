import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { errorMessage } from '../errors.js'
import {
  parseAndValidateFeature,
  parseAndValidateMdg,
  validateOpenSpecFile,
} from '../validation/official.js'

const usage = 'Usage: validate-spec [--format openspec|mdg|feature] <file>'

export async function runValidatorCli(args = process.argv.slice(2)): Promise<number> {
  try {
    let format: string | undefined
    let file: string | undefined
    for (let index = 0; index < args.length; index++) {
      if (args[index] === '--format') {
        format = args[++index]
        if (!format) throw new Error(usage)
      } else if (!file && !args[index].startsWith('-')) file = args[index]
      else throw new Error(usage)
    }
    if (!file || (format && !['openspec', 'mdg', 'feature', 'gherkin'].includes(format)))
      throw new Error(usage)
    const path = resolve(file)
    format ??= path.endsWith('.feature.md')
      ? 'mdg'
      : path.endsWith('.feature')
        ? 'feature'
        : 'openspec'
    if (format === 'gherkin') format = path.endsWith('.feature.md') ? 'mdg' : 'feature'
    const text = await readFile(path, 'utf8')
    if (format === 'openspec') {
      const report = await validateOpenSpecFile(path)
      process.stdout.write(
        `${JSON.stringify({ format, file: path, valid: report.valid, issues: report.issues }, null, 2)}\n`,
      )
      return report.valid ? 0 : 1
    }
    const parse = format === 'mdg' ? parseAndValidateMdg : parseAndValidateFeature
    const report = parse(text, pathToFileURL(path).href)
    process.stdout.write(
      `${JSON.stringify({ format, file: path, valid: report.valid, errors: report.errors }, null, 2)}\n`,
    )
    return report.valid ? 0 : 1
  } catch (error) {
    process.stderr.write(`${errorMessage(error)}\n`)
    return 2
  }
}
