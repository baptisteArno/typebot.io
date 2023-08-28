declare const window: {
  __ENV?: any
}

const isBrowser = () => Boolean(typeof window !== 'undefined' && window.__ENV)

export const getRuntimeVariable = (key: string) => {
  if (isBrowser()) return window.__ENV[key]
  return process.env[key]
}
