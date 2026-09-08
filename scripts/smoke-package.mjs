import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access, cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = fileURLToPath(new URL('..', import.meta.url))
const workspace = await mkdtemp(path.join(tmpdir(), 'opsx-package-'))
const metadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const profilePath = 'skills/opsx-gherkin/references/OPENSPEC_MDG_PROFILE.feature.md'

function run(command, args, { cwd = workspace, input, status = 0 } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    input,
    encoding: 'utf8',
    timeout: 120_000,
    env: { ...process.env, npm_config_cache: path.join(workspace, '.npm-cache') },
  })
  if (result.error) throw result.error
  assert.equal(
    result.status,
    status,
    `${command} ${args[0] ?? ''}\n${result.stdout}\n${result.stderr}`,
  )
  return result.stdout
}

async function assertLinks(file, boundary) {
  const text = await readFile(file, 'utf8')
  for (const [, target] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(target)) continue
    const resolved = path.resolve(path.dirname(file), target.split('#')[0])
    const relative = path.relative(boundary, resolved)
    assert.ok(
      !relative.startsWith('..') && !path.isAbsolute(relative),
      `Reference escapes bundle: ${target}`,
    )
    await access(resolved)
  }
}

try {
  const [packed] = JSON.parse(
    run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', workspace], {
      cwd: root,
    }),
  )
  assert.equal(packed.name, metadata.name)
  const files = packed.files.map((entry) => entry.path)
  for (const required of [
    ...Object.values(metadata.bin).map((name) => name.replace(/^\.\//, '')),
    profilePath,
    'skills/opsx-gherkin/SKILL.md',
    'README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'LICENSE',
  ]) {
    assert.ok(files.includes(required), `Missing package resource: ${required}`)
  }
  assert.deepEqual(
    files.filter((name) => name.endsWith('OPENSPEC_MDG_PROFILE.feature.md')),
    [profilePath],
  )
  assert.ok(
    files.every(
      (name) =>
        !/^(src|tests|test|outputs|work|node_modules|\.agents|openspec|scripts)\//.test(name),
    ),
    'Unexpected development files in package',
  )
  const tarball = path.join(workspace, packed.filename)
  await writeFile(path.join(workspace, 'package.json'), '{"private":true,"type":"module"}\n')
  run('npm', ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', tarball])
  const installed = path.join(workspace, 'node_modules', metadata.name)
  const dependencies = await readdir(path.join(workspace, 'node_modules'))
  assert.ok(
    !dependencies.includes('vitest') && !dependencies.includes('typescript'),
    'Development dependencies installed for consumer',
  )
  const require = createRequire(path.join(installed, 'package.json'))
  const { generateMessages } = await import(require.resolve('@cucumber/gherkin'))
  const { SourceMediaType, IdGenerator } = await import(require.resolve('@cucumber/messages'))
  const inspect = (text, markdown) => {
    const envelopes = generateMessages(
      text,
      markdown ? 'result.feature.md' : 'result.feature',
      markdown
        ? SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_MARKDOWN
        : SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
      {
        includeGherkinDocument: true,
        includePickles: true,
        newId: IdGenerator.incrementing(),
      },
    )
    assert.equal(envelopes.filter((entry) => entry.parseError).length, 0)
    return envelopes.flatMap((entry) => (entry.pickle ? [entry.pickle] : []))
  }

  const bin = (name, args, options) => run('npx', ['--no-install', name, ...args], options)
  const profile = await readFile(path.join(installed, profilePath), 'utf8')
  assert.equal(profile, await readFile(path.join(root, profilePath), 'utf8'))
  assert.equal(bin('opsx-gherkin', ['profile']), profile)
  assert.equal(bin('opsx-gherkin', ['instructions']), profile)
  assert.match(bin('opsx-gherkin', ['--help']), /opsx-gherkin profile/)

  for (const [name, expectedCount] of [
    ['minimal', 1],
    ['account', 5],
    ['authentication-delta', 2],
  ]) {
    const source = path.join(
      installed,
      `skills/opsx-gherkin/references/examples/${name}.feature.md`,
    )
    const expected = await readFile(
      path.join(installed, `skills/opsx-gherkin/references/examples/${name}.openspec.md`),
      'utf8',
    )
    const opsx = bin('mdg-to-opsx', [source])
    assert.equal(opsx, expected)
    assert.equal(bin('opsx-gherkin', ['mdg-to-opsx', source]), opsx)
    const mdg = bin('opsx-to-mdg', [], { input: opsx })
    const feature = bin('opsx-to-feature', [], { input: opsx })
    assert.equal(bin('mdg-to-opsx', [], { input: mdg }), opsx)
    assert.equal(inspect(mdg, true).length, expectedCount)
    assert.equal(inspect(feature, false).length, expectedCount)
    const mdgPath = path.join(workspace, `${name}.feature.md`)
    const featurePath = path.join(workspace, `${name}.feature`)
    await writeFile(mdgPath, mdg)
    await writeFile(featurePath, feature)
    assert.equal(JSON.parse(bin('validate-spec', ['--format', 'mdg', mdgPath])).valid, true)
    assert.equal(JSON.parse(bin('validate-spec', ['--format', 'feature', featurePath])).valid, true)
    if (name !== 'authentication-delta') {
      const mainPath = path.join(workspace, 'spec.md')
      await writeFile(mainPath, opsx)
      assert.equal(JSON.parse(bin('validate-spec', ['--format', 'openspec', mainPath])).valid, true)
    }
  }

  // Exercise npx's tarball cache path without relying on the consumer's local bins.
  assert.equal(
    run('npx', ['--yes', '--package', tarball, 'opsx-gherkin', 'profile'], { cwd: tmpdir() }),
    profile,
  )
  const copied = path.join(workspace, 'copied-skill')
  await cp(path.join(installed, 'skills/opsx-gherkin'), copied, { recursive: true })
  const entry = await readFile(path.join(copied, 'SKILL.md'), 'utf8')
  const frontmatter = entry.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(frontmatter, 'Skill frontmatter missing')
  const skill = parse(frontmatter[1])
  assert.equal(skill.name, metadata.name)
  assert.equal(typeof skill.description, 'string')
  await assertLinks(path.join(copied, 'SKILL.md'), copied)
  await assertLinks(path.join(installed, 'README.md'), installed)
  await assertLinks(path.join(installed, 'CONTRIBUTING.md'), installed)

  // A missing canonical resource must fail instead of falling back to a hidden duplicate.
  await rm(path.join(installed, profilePath))
  assert.equal(bin('opsx-gherkin', ['profile'], { status: 2 }), '')
  process.stdout.write(
    `Package smoke passed: ${packed.entryCount} files, five binaries, three conversions, official validation, npm/npx, and self-contained skill.\n`,
  )
} finally {
  await rm(workspace, { recursive: true, force: true })
}
