import type { Readable } from 'node:stream'
import type { Direction } from '../model.js'

interface Options {
  force: boolean
  help: boolean
  text?: string
  input?: string
  output?: string
  name?: string
  projectRoot?: string
}

import { link, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { mdgToOpsx, opsxToFeature, opsxToMdg } from '../convert.js'
import { ConversionError, isFsError } from '../errors.js'

export async function runConverterCli(
  direction: Direction,
  argv = process.argv.slice(2),
): Promise<number> {
  try {
    const options = parseArgs(argv, direction)
    if (options.help) {
      process.stdout.write(usage(direction))
      return 0
    }
    const input = await readInput(options)
    const converters = {
      'mdg-to-opsx': mdgToOpsx,
      'opsx-to-mdg': opsxToMdg,
      'opsx-to-feature': opsxToFeature,
    }
    const convert = converters[direction]
    const output = await convert(input.text, {
      sourcePath: input.path,
      name: options.name,
      projectRoot: options.projectRoot ? resolve(options.projectRoot) : undefined,
    })
    if (options.output) await writeAtomic(resolve(options.output), output, options.force)
    else process.stdout.write(output)
    return 0
  } catch (error) {
    if (error instanceof ConversionError) {
      process.stderr.write(`${error.message}\n`)
      for (const diagnostic of error.diagnostics) process.stderr.write(`- ${diagnostic}\n`)
      return 1
    }
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    return 2
  }
}

function parseArgs(argv: string[], direction: Direction): Options {
  const options: Options = { force: false, help: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--force') options.force = true
    else if (argument === '--text') options.text = requiredValue(argv, ++index, argument)
    else if (argument === '--output' || argument === '-o')
      options.output = requiredValue(argv, ++index, argument)
    else if (argument === '--name') options.name = requiredValue(argv, ++index, argument)
    else if (argument === '--project-root')
      options.projectRoot = requiredValue(argv, ++index, argument)
    else if (argument.startsWith('-'))
      throw new Error(`Unknown option: ${argument}\n${usage(direction)}`)
    else if (!options.input) options.input = argument
    else throw new Error(`Only one input path is allowed\n${usage(direction)}`)
  }
  if (options.input && options.text !== undefined)
    throw new Error(`Use either an input path or --text, not both\n${usage(direction)}`)
  if (options.force && !options.output) throw new Error('--force requires --output')
  return options
}

async function readInput(options: Options) {
  if (options.text !== undefined) return { text: options.text, path: undefined }
  if (options.input) {
    const path = resolve(options.input)
    return { text: await readFile(path, 'utf8'), path }
  }
  if (process.stdin.isTTY) throw new Error('No input: pass a path, --text, or pipe text on stdin')
  return { text: await readStream(process.stdin), path: undefined }
}

async function readStream(stream: Readable): Promise<string> {
  stream.setEncoding('utf8')
  let result = ''
  for await (const chunk of stream) result += chunk
  return result
}

export async function writeAtomic(path: string, content: string, force: boolean): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const temporary = resolve(dirname(path), `.${basename(path)}.${process.pid}.${Date.now()}.tmp`)
  await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' })
  try {
    if (force) await rename(temporary, path)
    else {
      try {
        await link(temporary, path)
      } catch (error) {
        if (isFsError(error, 'EEXIST'))
          throw new Error(`Output already exists: ${path} (use --force to replace it)`)
        throw error
      }
      await unlink(temporary)
    }
  } catch (error) {
    await unlink(temporary).catch(() => {})
    throw error
  }
}

function requiredValue(argv: string[], index: number, option: string): string {
  if (index >= argv.length) throw new Error(`Missing value for ${option}`)
  return argv[index]
}

function usage(direction: Direction): string {
  return `Usage: ${direction} [input] [--text content] [-o output] [--force] [--name name] [--project-root path]\n`
}
