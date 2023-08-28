import { env } from '@typebot.io/env'

export const defaultTransportOptions = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
}

export const defaultFrom = {
  name: env.NEXT_PUBLIC_SMTP_FROM?.split(' <')[0].replace(/"/g, ''),
  email: env.NEXT_PUBLIC_SMTP_FROM?.match(/<(.*)>/)?.pop(),
}
