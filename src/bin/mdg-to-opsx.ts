#!/usr/bin/env node
import { runConverterCli } from '../cli/converter.js'

process.exitCode = await runConverterCli('mdg-to-opsx')
