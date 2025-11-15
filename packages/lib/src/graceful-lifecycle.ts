interface GracefulOptions {
  totalMs?: number // Total grace window in ms
  forcedExitBufferMs?: number // Time before end to force exit
  component?: string // Optional identifier for logging
}

interface GracefulState {
  draining: boolean
  drainStartedAt: number | null
  forcedExitTimer: NodeJS.Timeout | null
  totalMs: number
  forcedExitMs: number
  component?: string
  activeRequests: number // business requests only
  probeRequests: number // health/readiness/liveness probes (not counted as active business requests)
}

const defaultTotal = parseInt(process.env.GRACEFUL_TIMEOUT_MS || '170000', 10)
const defaultBuffer = parseInt(
  process.env.GRACEFUL_FORCED_EXIT_BUFFER_MS || '5000',
  10
)

const thresholdMbCache = (() => {
  const raw = process.env.MEMORY_DRAIN_THRESHOLD_MB
  const parsed = raw ? parseInt(raw, 10) : NaN
  return !isNaN(parsed) && parsed > 0 ? parsed : 1024
})()

const state: GracefulState = {
  draining: false,
  drainStartedAt: null,
  forcedExitTimer: null,
  totalMs: defaultTotal,
  forcedExitMs: Math.max(1000, defaultTotal - defaultBuffer),
  component: undefined,
  activeRequests: 0,
  probeRequests: 0,
}

export function initGraceful(opts?: GracefulOptions) {
  if (opts?.totalMs && opts.totalMs > 0) {
    state.totalMs = opts.totalMs
  }
  if (opts?.forcedExitBufferMs && opts.forcedExitBufferMs > 0) {
    state.forcedExitMs = Math.max(
      1000,
      (opts.totalMs || state.totalMs) - opts.forcedExitBufferMs
    )
  }
  if (opts?.component) state.component = opts.component
}

export function triggerDrain(): void {
  if (state.draining) return
  state.draining = true
  state.drainStartedAt = Date.now()
  if (!state.forcedExitTimer) {
    state.forcedExitTimer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log({
        event: 'forced_exit',
        ts: new Date().toISOString(),
        component: state.component,
        activeRequests: state.activeRequests,
        configuredExitMs: state.forcedExitMs,
        totalWindowMs: state.totalMs,
        drainDurationMs: state.drainStartedAt
          ? Date.now() - state.drainStartedAt
          : undefined,
      })
      process.exit(0)
    }, state.forcedExitMs)
    // Allows the process to exit naturally if all operations finish before the timeout.
    // In Node.js, "ref" timers keep the event loop alive; unref() allows exit if nothing else is pending.
    state.forcedExitTimer?.unref?.()
  }
  // eslint-disable-next-line no-console
  console.log({
    event: 'drain_start',
    ts: new Date().toISOString(),
    forcedExitInMs: state.forcedExitMs,
    component: state.component,
    activeRequests: state.activeRequests,
  })
}

// Opcional: registrar conclusão graciosa antes do forced exit (chamar após server.close e nenhuma conexão ativa)
export function finalizeDrain() {
  if (!state.draining) return
  if (state.forcedExitTimer) {
    clearTimeout(state.forcedExitTimer)
    state.forcedExitTimer = null
  }
  // eslint-disable-next-line no-console
  console.log({
    event: 'drain_complete',
    ts: new Date().toISOString(),
    durationMs: state.drainStartedAt
      ? Date.now() - state.drainStartedAt
      : undefined,
    component: state.component,
    activeRequests: state.activeRequests,
  })
}

export function isDraining(): boolean {
  return state.draining
}

export function healthSnapshot() {
  const mem = process.memoryUsage()
  const thresholdMb = thresholdMbCache
  const thresholdBytes = thresholdMb * 1024 * 1024
  // Trigger drain if memory usage exceeds threshold and not already draining
  if (!state.draining && mem.rss > thresholdBytes) {
    // eslint-disable-next-line no-console
    console.log({
      event: 'auto_drain_memory_threshold',
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      threshold: thresholdBytes,
      thresholdMb,
      component: state.component,
    })
    triggerDrain()
  }
  if (state.draining) {
    return {
      status: 'draining' as const,
      sinceMs: state.drainStartedAt ? Date.now() - state.drainStartedAt : 0,
      mem: { rss: mem.rss, heapUsed: mem.heapUsed },
      activeRequests: state.activeRequests,
      probeRequests: state.probeRequests,
    }
  }
  return {
    status: 'ready' as const,
    mem: { rss: mem.rss, heapUsed: mem.heapUsed },
    activeRequests: state.activeRequests,
    probeRequests: state.probeRequests,
  }
}

interface BeginRequestOptions {
  kind?: 'business' | 'probe'
  track?: boolean // if false, skip counting entirely
}

// Track lifecycle for business requests; probes optionally excluded.
export function beginRequest(opts?: BeginRequestOptions) {
  const isProbe = opts?.kind === 'probe'
  const shouldTrack = opts?.track !== false && !isProbe
  if (isProbe) {
    state.probeRequests++
  } else if (shouldTrack) {
    state.activeRequests++
  }
  const startedAt = Date.now()
  return function endRequest() {
    if (isProbe) {
      // No decrement for probeRequests; they are instantaneous samples.
      return
    }
    if (shouldTrack) {
      state.activeRequests = Math.max(0, state.activeRequests - 1)
      if (state.draining) {
        const duration = Date.now() - startedAt
        if (duration > 5000) {
          // eslint-disable-next-line no-console
          console.log({
            event: 'drain_request_slow',
            ms: duration,
            component: state.component,
            activeRequests: state.activeRequests,
          })
        }
      }
    }
  }
}
