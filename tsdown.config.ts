import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    'mdg-to-opsx': 'src/bin/mdg-to-opsx.ts',
    'opsx-to-mdg': 'src/bin/opsx-to-mdg.ts',
    'opsx-to-feature': 'src/bin/opsx-to-feature.ts',
    'validate-spec': 'src/bin/validate-spec.ts',
  },
  format: 'esm',
  dts: false,
  clean: true,
  sourcemap: true,
  platform: 'node',
  target: 'node22',
  deps: { neverBundle: ['@fission-ai/openspec', '@cucumber/gherkin', '@cucumber/messages'] },
})
