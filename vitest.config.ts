import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/parsers/**/*.ts',
        'src/renderers/**/*.ts',
        'src/validation/profile.ts',
        'src/convert.ts',
        'src/model.ts',
        'src/syntax.ts',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 },
    },
  },
})
