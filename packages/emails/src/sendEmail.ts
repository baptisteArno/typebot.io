import { createTransport, SendMailOptions } from 'nodemailer'
import { env } from '@typebot.io/env'

export const sendEmail = (
  props: Pick<SendMailOptions, 'to' | 'html' | 'subject'>
) => {
  const transporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
  })

  return transporter.sendMail({
    from: env.NEXT_PUBLIC_SMTP_FROM,
    ...props,
  })
}
