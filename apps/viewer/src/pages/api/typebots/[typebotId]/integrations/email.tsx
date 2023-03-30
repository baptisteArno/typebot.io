import {
  PublicTypebot,
  ResultValues,
  SendEmailOptions,
  SmtpCredentials,
} from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { createTransport, getTestMessageUrl } from 'nodemailer'
import { isDefined, isEmpty, isNotDefined, omit } from '@typebot.io/lib'
import { parseAnswers } from '@typebot.io/lib/results'
import { methodNotAllowed, initMiddleware, decrypt } from '@typebot.io/lib/api'

import Cors from 'cors'
import Mail from 'nodemailer/lib/mailer'
import { DefaultBotNotificationEmail } from '@typebot.io/emails'
import { render } from '@faire/mjml-react/utils/render'
import prisma from '@/lib/prisma'
import { getPreviouslyLinkedTypebots } from '@/features/blocks/logic/typebotLink/getPreviouslyLinkedTypebots'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'

const cors = initMiddleware(Cors())

const defaultTransportOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
}

const defaultFrom = {
  name: process.env.SMTP_FROM?.split(' <')[0].replace(/"/g, ''),
  email: process.env.SMTP_FROM?.match(/<(.*)>/)?.pop(),
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const resultId = req.query.resultId as string | undefined
    const {
      credentialsId,
      recipients,
      body,
      subject,
      cc,
      bcc,
      replyTo,
      isBodyCode,
      isCustomBody,
      resultValues,
      fileUrls,
    } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as SendEmailOptions & {
      resultValues: ResultValues
      fileUrls?: string
    }
    const { name: replyToName } = parseEmailRecipient(replyTo)

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

    const emailBody = await getEmailBody({
      body,
      isCustomBody,
      isBodyCode,
      typebotId,
      resultValues,
    })

    if (!emailBody) {
      await saveErrorLog({
        resultId,
        message: 'Email not sent',
        details: {
          transportConfig,
          recipients,
          subject,
          cc,
          bcc,
          replyTo,
          emailBody,
        },
      })
      return res.status(404).send({ message: "Couldn't find email body" })
    }
    const transporter = createTransport(transportConfig)
    const fromName = isEmpty(replyToName) ? from.name : replyToName
    const email: Mail.Options = {
      from: fromName ? `"${fromName}" <${from.email}>` : from.email,
      cc,
      bcc,
      to: recipients,
      replyTo,
      subject,
      attachments: fileUrls
        ?.split(', ')
        .map((url) => (url.startsWith('http') ? { path: url } : undefined))
        .filter(isDefined),
      ...emailBody,
    }
    try {
      const info = await transporter.sendMail(email)
      await saveSuccessLog({
        resultId,
        message: 'Email successfully sent',
        details: {
          transportConfig: {
            ...transportConfig,
            auth: { user: transportConfig.auth.user, pass: '******' },
          },
          email,
        },
      })
      return res.status(200).send({
        message: 'Email sent!',
        info,
        previewUrl: getTestMessageUrl(info),
      })
    } catch (err) {
      await saveErrorLog({
        resultId,
        message: 'Email not sent',
        details: {
          transportConfig: {
            ...transportConfig,
            auth: { user: transportConfig.auth.user, pass: '******' },
          },
          email,
          error: err,
        },
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
): Promise<SmtpCredentials['data'] | undefined> => {
  if (credentialsId === 'default')
    return {
      host: defaultTransportOptions.host,
      port: defaultTransportOptions.port,
      username: defaultTransportOptions.auth.user,
      password: defaultTransportOptions.auth.pass,
      isTlsEnabled: undefined,
      from: defaultFrom,
    }
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return decrypt(credentials.data, credentials.iv) as SmtpCredentials['data']
}

const getEmailBody = async ({
  body,
  isCustomBody,
  isBodyCode,
  typebotId,
  resultValues,
}: {
  typebotId: string
  resultValues: ResultValues
} & Pick<SendEmailOptions, 'isCustomBody' | 'isBodyCode' | 'body'>): Promise<
  { html?: string; text?: string } | undefined
> => {
  if (isCustomBody || (isNotDefined(isCustomBody) && !isEmpty(body)))
    return {
      html: isBodyCode ? body : undefined,
      text: !isBodyCode ? body : undefined,
    }
  const typebot = (await prisma.publicTypebot.findUnique({
    where: { typebotId },
  })) as unknown as PublicTypebot
  if (!typebot) return
  const linkedTypebots = await getPreviouslyLinkedTypebots({
    typebots: [typebot],
  })([])
  const answers = parseAnswers(typebot, linkedTypebots)(resultValues)
  return {
    html: render(
      <DefaultBotNotificationEmail
        resultsUrl={`${process.env.NEXTAUTH_URL}/typebots/${typebot.id}/results`}
        answers={omit(answers, 'submittedAt')}
      />
    ).html,
  }
}

const parseEmailRecipient = (
  recipient?: string
): { email?: string; name?: string } => {
  if (!recipient) return {}
  if (recipient.includes('<')) {
    const [name, email] = recipient.split('<')
    return {
      name: name.replace(/>/g, '').trim().replace(/"/g, ''),
      email: email.replace('>', '').trim(),
    }
  }
  return {
    email: recipient,
  }
}

export default handler
