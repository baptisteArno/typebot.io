import { createTransport } from 'nodemailer'

export const sendEmailNotification = ({
  to,
  subject,
  content,
}: {
  to: string
  subject: string
  content: string
}) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  return transporter.sendMail({
    from: process.env.NEXT_PUBLIC_SMTP_FROM,
    to,
    subject,
    html: content,
  })
}
