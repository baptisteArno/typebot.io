import logger from '@/helpers/logger'

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
        logger.debug('extractToolOutput: found Tool Output log')
        return typeof log.details.response === 'string'
          ? log.details.response
          : JSON.stringify(log.details.response)
      }
    }
  }
  logger.warn(
    'extractToolOutput: Tool Output log not found, returning full result',
    {
      logCount: result.logs?.length ?? 0,
    }
  )
  return JSON.stringify(result)
}
