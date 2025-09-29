import tracer from 'dd-trace'

export interface DatadogInitOptions {
  service?: string
  env?: string
  version?: string
  logInjection?: boolean
  // Allow disabling entirely (e.g., tests)
  enabled?: boolean
}

/**
 * Ensures Datadog tracer is initialized exactly once (idempotent) on the server.
 * Should be called as early as possible (instrumentation.ts) to maximize auto‑instrumentation coverage.
 */
export function ensureDatadogInitialized(
  opts: DatadogInitOptions = {}
): boolean {
  if (typeof window !== 'undefined') return false
  if (process.env.NEXT_RUNTIME === 'edge') return false
  if (opts.enabled === false) return false
  try {
    if (!(tracer as any)._initialized) {
      tracer.init({
        service: opts.service || process.env.DD_SERVICE || 'typebot-app',
        env: opts.env || process.env.DD_ENV || process.env.NODE_ENV,
        version: opts.version || process.env.DD_VERSION,
        logInjection: opts.logInjection ?? true,
      })
      return true
    }
  } catch {
    // Swallow init errors (double init etc.)
  }
  return false
}
