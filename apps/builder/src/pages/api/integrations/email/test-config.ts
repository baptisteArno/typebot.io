import { captureException } from '@sentry/nextjs'
import { SmtpCredentialsData } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'
import { getAuthenticatedUser } from '@/features/auth/api'
import { notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    const { from, port, isTlsEnabled, username, password, host, to } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as SmtpCredentialsData & { to: string }
    const transporter = createTransport({
      host,
      port,
      secure: isTlsEnabled ?? undefined,
      auth: {
        user: username,
        pass: password,
      },
    })
    try {
      const info = await transporter.sendMail({
        from: from.name ? `"${from.name}" <${from.email}>` : from.email,
        to,
        subject: 'Your SMTP configuration is working 🤩',
        text: 'This email has been sent to test out your SMTP config.\n\nIf your read this then it has been successful.🚀',
      })
      res.status(200).send({ message: 'Email sent!', info })
    } catch (err) {
      captureException(err)
      console.log(err)
      res.status(500).send(err)
    }
  }
}

export default handler
