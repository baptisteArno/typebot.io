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
    host: process.env.AUTH_EMAIL_SERVER_HOST,
    port: Number(process.env.AUTH_EMAIL_SERVER_PORT),
    auth: {
      user: process.env.AUTH_EMAIL_SERVER_USER,
      pass: process.env.AUTH_EMAIL_SERVER_PASSWORD,
    },
  })

  return transporter.sendMail({
    from: `"${process.env.AUTH_EMAIL_FROM_NAME}" <${process.env.AUTH_EMAIL_FROM_EMAIL}>`,
    to,
    subject,
    html: content,
  })
}
