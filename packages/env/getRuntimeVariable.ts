declare const window: {
  __ENV?: any
}

export const getRuntimeVariable = (key: string) => {
  if (typeof window !== 'undefined')
    return window.__ENV ? window.__ENV[key] : undefined
  if (typeof process === 'undefined') return undefined
  return process.env[key]
}
