import tracer from 'dd-trace'

// Extract route data safely without depending on express types
interface RequestLike {
  baseUrl?: unknown
  path?: unknown
}
interface NextOptions {
  ctx?: object
}
type NextFn = (opts?: NextOptions) => Promise<unknown>
// New interface to avoid any
interface TRPCMiddlewareFactory {
  middleware: (
    resolver: (opts: { ctx: unknown; next: NextFn }) => Promise<unknown>
  ) => unknown
}
const extractRoute = (
  req: unknown
): { baseUrl: string; path: string } | null => {
  if (!req || typeof req !== 'object') return null
  const { baseUrl, path } = req as RequestLike
  const b = typeof baseUrl === 'string' ? baseUrl : ''
  const p = typeof path === 'string' ? path : ''
  if (!b && !p) return null
  return { baseUrl: b, path: p }
}

/**
 * Factory to create a Datadog enrichment middleware for a given tRPC instance.
 * Attaches trace/span ids to ctx.datadog and tags http.route when available.
 */
export const createDatadogLoggerMiddleware = (t: TRPCMiddlewareFactory) =>
  t.middleware(async ({ ctx, next }: { ctx: unknown; next: NextFn }) => {
    const span = tracer.scope().active()
    let traceId: string | null = null
    let spanId: string | null = null
    const ddContext = span?.context()
    if (ddContext) {
      if (typeof ddContext.toTraceId === 'function')
        traceId = ddContext.toTraceId()
      if (typeof ddContext.toSpanId === 'function')
        spanId = ddContext.toSpanId()
    }

    if (span) {
      const reqObj = (ctx as { req?: unknown }).req
      const route = extractRoute(reqObj)
      if (
        route &&
        route.baseUrl &&
        route.path &&
        route.baseUrl.endsWith('/api/rpc')
      ) {
        span.setTag &&
          span.setTag('http.route', `${route.baseUrl}${route.path}`)
      }
    }

    return next({
      ctx: {
        ...(ctx as object),
        datadog: { traceId, spanId },
      },
    })
  })
