// eslint-disable-next-line @typescript-eslint/no-explicit-any
let logger: any

if (
  typeof window === 'undefined' &&
  !process.env.NODE_ENV?.includes('development')
) {
  // Só importa winston no server
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const winston = require('winston')
  logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    exitOnError: false,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      ...(process.env.DD_LOGS_ENABLED === 'true'
        ? [
            new winston.transports.Http({
              host: 'http-intake.logs.datadoghq.com',
              path: `/v1/input/${
                process.env.DD_API_KEY
              }?ddsource=nodejs&service=${process.env.DD_SERVICE || 'typebot'}`,
              ssl: true,
            }),
          ]
        : []),
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const util = require('util')

  // Redireciona console para o logger
  console.log = (...args: unknown[]) => logger.log(util.format(...args))
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
