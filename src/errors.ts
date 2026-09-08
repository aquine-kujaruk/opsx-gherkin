export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly diagnostics: readonly string[] = [],
  ) {
    super(message)
    this.name = 'ConversionError'
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function isFsError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code
}
