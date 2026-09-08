#!/usr/bin/env node
import { runValidatorCli } from '../cli/validator.js'

process.exitCode = await runValidatorCli()
