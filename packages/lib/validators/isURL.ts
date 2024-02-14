import isURL, { IsURLOptions } from 'validator/lib/isURL'

const customIsURL = (val: string, options?: IsURLOptions) =>
  isURL(val, {
    protocols: ['https', 'http'],
    require_protocol: true,
    ...options,
  })

export { customIsURL as isURL }
