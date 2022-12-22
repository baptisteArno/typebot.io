import { ExecuteIntegrationResponse } from '@/features/chat'
import { saveErrorLog, saveSuccessLog } from '@/features/logs/api'
import { parseVariables } from '@/features/variables'
import prisma from '@/lib/prisma'
import { render } from '@faire/mjml-react/dist/src/utils/render'
import { DefaultBotNotificationEmail } from 'emails'
import {
  PublicTypebot,
  ResultValues,
  SendEmailBlock,
  SendEmailOptions,
  SessionState,
  SmtpCredentialsData,
} from 'models'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { byId, isEmpty, isNotDefined, omit, parseAnswers } from 'utils'
import { decrypt } from 'utils/api'
import { defaultFrom, defaultTransportOptions } from '../constants'

export const executeSendEmailBlock = async (
  { result, typebot }: SessionState,
  block: SendEmailBlock
): Promise<ExecuteIntegrationResponse> => {
  const { options } = block
  const { variables } = typebot
  await sendEmail({
    typebotId: typebot.id,
    resultId: result?.id,
    credentialsId: options.credentialsId,
    recipients: options.recipients.map(parseVariables(variables)),
    subject: parseVariables(variables)(options.subject ?? ''),
    body: parseVariables(variables)(options.body ?? ''),
    cc: (options.cc ?? []).map(parseVariables(variables)),
    bcc: (options.bcc ?? []).map(parseVariables(variables)),
    replyTo: options.replyTo
      ? parseVariables(variables)(options.replyTo)
      : undefined,
    fileUrls:
      variables.find(byId(options.attachmentsVariableId))?.value ?? undefined,
    isCustomBody: options.isCustomBody,
    isBodyCode: options.isBodyCode,
  })
  return { outgoingEdgeId: block.outgoingEdgeId }
}

const sendEmail = async ({
  typebotId,
  resultId,
  credentialsId,
  recipients,
  body,
  subject,
  cc,
  bcc,
  replyTo,
  isBodyCode,
  isCustomBody,
  fileUrls,
}: SendEmailOptions & {
  typebotId: string
  resultId?: string
  fileUrls?: string
}) => {
  const { name: replyToName } = parseEmailRecipient(replyTo)

  const { host, port, isTlsEnabled, username, password, from } =
    (await getEmailInfo(credentialsId)) ?? {}
  if (!from) return

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
    resultId,
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
    attachments: fileUrls?.split(', ').map((url) => ({ path: url })),
    ...emailBody,
  }
  try {
    await transporter.sendMail(email)
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
  }
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
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return decrypt(credentials.data, credentials.iv) as SmtpCredentialsData
}

const getEmailBody = async ({
  body,
  isCustomBody,
  isBodyCode,
  typebotId,
  resultId,
}: {
  typebotId: string
  resultId?: string
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
  const resultValues = (await prisma.result.findUnique({
    where: { id: resultId },
    include: { answers: true },
  })) as ResultValues | null
  if (!resultValues) return
  const answers = parseAnswers(typebot, [])(resultValues)
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
