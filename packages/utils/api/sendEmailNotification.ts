import { createTransport, SendMailOptions } from 'nodemailer'
import { env } from '../utils'

export const sendEmailNotification = (props: Omit<SendMailOptions, 'from'>) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  return transporter.sendMail({
    from: env('SMTP_FROM'),
    ...props,
  })
}
