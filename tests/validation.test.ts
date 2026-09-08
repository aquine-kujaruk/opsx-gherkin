import { access, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, vi } from 'vitest'
import { mdgToOpsx } from '../src/convert.js'
import { validateOpenSpec } from '../src/validation/official.js'
import { delta } from './helpers.js'

test('delta validation cleans up private temporary files on success and rejection', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'opsx-validation-test-'))
  try {
    for (const name of ['TMPDIR', 'TMP', 'TEMP']) vi.stubEnv(name, workspace)
    const project = join(workspace, 'public-project')
    const input = await mdgToOpsx(delta)
    expect(
      (
        await validateOpenSpec(input, {
          kind: 'delta',
          name: 'identity/authentication',
          projectRoot: project,
        })
      ).valid,
    ).toBe(true)
    expect(
      (await validateOpenSpec('## ADDED Requirements\n', { kind: 'delta', name: 'invalid' })).valid,
    ).toBe(false)
    expect((await validateOpenSpec(input, { kind: 'delta', name: '../escape' })).valid).toBe(false)
    expect(await readdir(workspace)).toEqual([])
    await expect(access(project)).rejects.toThrow()
  } finally {
    vi.unstubAllEnvs()
    await rm(workspace, { recursive: true, force: true })
  }
})
