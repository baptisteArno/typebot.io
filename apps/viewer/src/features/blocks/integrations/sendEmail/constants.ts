export const defaultTransportOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
}

export const defaultFrom = {
  name: process.env.SMTP_FROM?.split(' <')[0].replace(/"/g, ''),
  email: process.env.SMTP_FROM?.match(/<(.*)>/)?.pop(),
}
