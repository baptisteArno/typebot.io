//import prisma from 'libs/prisma'
import { SendEmailOptions, SmtpCredentialsData } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { createTransport, getTestMessageUrl } from 'nodemailer'
import { decrypt, initMiddleware, methodNotAllowed } from 'utils'

import Cors from 'cors'
import { withSentry } from '@sentry/nextjs'
import { saveErrorLog, saveSuccessLog } from 'services/api/utils'

const cors = initMiddleware(Cors())

const defaultTransportOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
}

const defaultFrom = {
  name: process.env.NEXT_PUBLIC_SMTP_FROM?.split(' <')[0].replace(/"/g, ''),
  email: process.env.NEXT_PUBLIC_SMTP_FROM?.match(/\<(.*)\>/)?.pop(),
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const resultId = req.query.resultId as string | undefined
    const { credentialsId, recipients, body, subject, cc, bcc, replyTo } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as SendEmailOptions

    const { host, port, isTlsEnabled, username, password, from } =
      (await getEmailInfo(credentialsId)) ?? {}
    if (!from)
      return res.status(404).send({ message: "Couldn't find credentials" })

    const transportConfig = {
      host,
      port,
      secure: isTlsEnabled ?? undefined,
      auth: {
        user: username,
        pass: password,
      },
    }
    const transporter = createTransport(transportConfig)
    const email = {
      from: `"${from.name}" <${from.email}>`,
      cc,
      bcc,
      to: recipients,
      replyTo,
      subject,
      text: body,
    }
    try {
      const info = await transporter.sendMail(email)
      await saveSuccessLog(resultId, 'Email successfully sent')
      return res.status(200).send({
        message: 'Email sent!',
        info,
        previewUrl: getTestMessageUrl(info),
      })
    } catch (err) {
      await saveErrorLog(resultId, 'Email not sent', {
        transportConfig,
        email,
      })
      return res.status(500).send({
        message: `Email not sent. Error: ${err}`,
      })
    }
  }
  return methodNotAllowed(res)
}

const getEmailInfo = async (
  credentialsId: string
): Promise<SmtpCredentialsData | undefined> => {
  if (credentialsId === 'default')
    return {
      host: defaultTransportOptions.host,
      port: defaultTransportOptions.port,
      username: defaultTransportOptions.auth.user,
      password: defaultTransportOptions.auth.pass,
      isTlsEnabled: undefined,
      from: defaultFrom,
    }
  // const credentials = await prisma.credentials.findUnique({
  //   where: { id: credentialsId },
  // })
  // if (!credentials) return
  // return decrypt(credentials.data, credentials.iv) as SmtpCredentialsData
  return
}

export default withSentry(handler)
