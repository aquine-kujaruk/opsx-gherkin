import { readFile } from 'node:fs/promises'

export const profileUrl = new URL(
  './skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md',
  import.meta.resolve('opsx-gherkin/package.json'),
)

export function readProfile(): Promise<string> {
  return readFile(profileUrl, 'utf8')
}
