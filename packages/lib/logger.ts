// eslint-disable-next-line @typescript-eslint/no-explicit-any
let logger: any

if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Só importa winston no server
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const winston = require('winston')

  // Semântica ajustada: DD_LOGS_ENABLED === 'true' => manter JSON estruturado para ingestão.
  // Qualquer outro valor (incluindo 'false' ou ausência) => pretty human-readable.
  const prettyEnabled = process.env.DD_LOGS_ENABLED !== 'true'
  const level =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

  const baseFormats = [
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ]

  const jsonFormat = winston.format.json()
  const prettyFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf((info: any) => {
      const { timestamp, level, message, stack, ...rest } = info
      const restStr = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : ''
      return `${stack ? stack : message}${restStr}`
    })
  )

  logger = winston.createLogger({
    level,
    exitOnError: false,
    // Static Datadog pipeline fields -- present on every log entry.
    // Do NOT pass ddsource or service at individual call sites.
    defaultMeta: {
      ddsource: 'nodejs',
      service: process.env.DD_SERVICE ?? 'typebot-runner',
    },
    format: winston.format.combine(
      ...baseFormats,
      prettyEnabled ? prettyFormat : jsonFormat
    ),
    transports: [new winston.transports.Console()],
  })

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const util = require('util')

  // Redireciona console para o logger (mantém formato consistente)
  console.log = (...args: unknown[]) => logger.info(util.format(...args))
  console.info = (...args: unknown[]) => logger.info(util.format(...args))
  console.warn = (...args: unknown[]) => logger.warn(util.format(...args))
  console.error = (...args: unknown[]) => logger.error(util.format(...args))
  console.debug = (...args: unknown[]) => logger.debug(util.format(...args))
} else {
  // No client, logger é um objeto fake
  logger = {
    info: (...args: unknown[]) => console.info(...args),
    error: (...args: unknown[]) => console.error(...args),
    warn: (...args: unknown[]) => console.warn(...args),
    debug: (...args: unknown[]) => console.debug(...args),
    log: (...args: unknown[]) => console.log(...args),
  }
}

export default logger
