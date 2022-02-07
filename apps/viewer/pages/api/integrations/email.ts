import prisma from 'libs/prisma'
import { SendEmailOptions, SmtpCredentialsData } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'
import { Options } from 'nodemailer/lib/smtp-transport'
import { decrypt, initMiddleware } from 'utils'

import Cors from 'cors'

const cors = initMiddleware(Cors())

const defaultTransportOptions: Options = {
  host: process.env.EMAIL_NOTIFICATIONS_SERVER_HOST,
  port: Number(process.env.EMAIL_NOTIFICATIONS_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_NOTIFICATIONS_SERVER_USER,
    pass: process.env.EMAIL_NOTIFICATIONS_SERVER_PASSWORD,
  },
}

const defaultFrom = `"${process.env.NEXT_PUBLIC_EMAIL_NOTIFICATIONS_FROM_NAME}" <${process.env.NEXT_PUBLIC_EMAIL_NOTIFICATIONS_FROM_EMAIL}>`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const { credentialsId, recipients, body, subject } = JSON.parse(
      req.body
    ) as SendEmailOptions
    const credentials = await prisma.credentials.findUnique({
      where: { id: credentialsId },
    })

    if (!credentials)
      return res.status(404).send({ message: "Couldn't find credentials" })
    const { host, port, isTlsEnabled, username, password, from } = decrypt(
      credentials.data,
      credentials.iv
    ) as SmtpCredentialsData

    const transporter = createTransport(
      credentialsId === 'default'
        ? defaultTransportOptions
        : {
            host,
            port,
            secure: isTlsEnabled ?? undefined,
            auth: {
              user: username,
              pass: password,
            },
          }
    )
    const info = await transporter.sendMail({
      from:
        credentialsId === 'default'
          ? defaultFrom
          : `"${from.name}" <${from.email}>`,
      to: recipients.join(', '),
      subject,
      text: body,
    })

    res.status(200).send({ message: 'Email sent!', info })
  }
}

export default handler
