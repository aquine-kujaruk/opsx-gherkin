export default {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits', presetConfig: {} }],
    [
      '@semantic-release/release-notes-generator',
      { preset: 'conventionalcommits', presetConfig: {} },
    ],
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      { successComment: false, failComment: false, releasedLabels: false },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'pnpm-lock.yaml'],
        // biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release performs interpolation.
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
}
