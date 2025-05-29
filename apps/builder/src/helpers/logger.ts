// eslint-disable-next-line @typescript-eslint/no-explicit-any
let logger: any

if (typeof window === 'undefined') {
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

  // Redireciona console para o logger
  console.log = (...args) => logger.info(...args)
  console.info = (...args) => logger.info(...args)
  console.warn = (...args) => logger.warn(...args)
  console.error = (...args) => logger.error(...args)
  console.debug = (...args) => logger.debug(...args)
} else {
  // No client, logger é um objeto fake
  logger = {
    info: function () {},
    error: function () {},
    warn: function () {},
    debug: function () {},
    log: function () {},
  }
}

export default logger
