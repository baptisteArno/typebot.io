/**
 * Extract clean output from workflow execution result.
 * Looks for "Tool Output" log entry, falls back to full JSON.
 */
export function extractToolOutput(result: {
  logs?: Array<{
    description?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any
  }>
}): string {
  if (Array.isArray(result.logs)) {
    for (const log of result.logs) {
      if (log.description === 'Tool Output' && log.details?.response) {
        return typeof log.details.response === 'string'
          ? log.details.response
          : JSON.stringify(log.details.response)
      }
    }
  }
  return JSON.stringify(result)
}
