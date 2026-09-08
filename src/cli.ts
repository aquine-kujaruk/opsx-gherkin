#!/usr/bin/env node
import { runConverterCli } from './cli/converter.js'
import { errorMessage } from './errors.js'
import { readProfile } from './profile-resource.js'

const help = `Usage: opsx-gherkin <command> [options]

Before generating a compatible specification:
  npx opsx-gherkin profile

Commands:
  profile          Print the complete normative authoring and conversion contract
  instructions     Alias for profile
  mdg-to-opsx      Convert Markdown with Gherkin (.feature.md) to OpenSpec
  opsx-to-mdg      Convert OpenSpec to Markdown with Gherkin (.feature.md)
  opsx-to-feature  Convert OpenSpec to plain Gherkin (.feature)

Standalone validator:
  validate-spec [--format openspec|mdg|feature] <file>

Run <command> --help for converter options.
`

const [command, ...args] = process.argv.slice(2)
if (!command || ['--help', '-h', 'help'].includes(command)) {
  process.stdout.write(help)
} else if (command === 'profile' || command === 'instructions') {
  try {
    if (args.length) throw new Error(`The ${command} command accepts no arguments`)
    process.stdout.write(await readProfile())
  } catch (error) {
    process.stderr.write(`${errorMessage(error)}\n`)
    process.exitCode = 2
  }
} else if (
  command === 'mdg-to-opsx' ||
  command === 'opsx-to-mdg' ||
  command === 'opsx-to-feature'
) {
  process.exitCode = await runConverterCli(command, args)
} else {
  process.stderr.write(`Unknown command: ${command}\n\n${help}`)
  process.exitCode = 2
}
