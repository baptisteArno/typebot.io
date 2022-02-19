import { SmtpCredentialsData } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { from, port, isTlsEnabled, username, password, host, to } =
      JSON.parse(req.body) as SmtpCredentialsData & { to: string }
    console.log({
      host,
      port,
      secure: isTlsEnabled ?? undefined,
      auth: {
        user: username,
        pass: password,
      },
    })
    const transporter = createTransport({
      host,
      port,
      secure: isTlsEnabled ?? undefined,
      auth: {
        user: username,
        pass: password,
      },
    })
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject: 'Your SMTP configuration is working 🤩',
      text: 'This email has been sent to test out your SMTP config.\n\nIf your read this then it has been successful.🚀',
    })
    res.status(200).send({ message: 'Email sent!', info })
  }
}

export default handler
