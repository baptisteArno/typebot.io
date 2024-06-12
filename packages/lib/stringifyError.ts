export const stringifyError = (err: unknown): string =>
  typeof err === 'string'
    ? err
    : err instanceof Error
    ? err.name + ': ' + err.message
    : JSON.stringify(err)
