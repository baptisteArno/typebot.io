import { parseVariables } from '@/features/variables/parseVariables'
import prisma from '@/lib/prisma'
import { render } from '@faire/mjml-react/utils/render'
import { DefaultBotNotificationEmail } from '@typebot.io/emails'
import {
  PublicTypebot,
  ResultInSession,
  SendEmailBlock,
  SendEmailOptions,
  SessionState,
  SmtpCredentials,
  Variable,
} from '@typebot.io/schemas'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { byId, isDefined, isEmpty, isNotDefined, omit } from '@typebot.io/lib'
import { parseAnswers } from '@typebot.io/lib/results'
import { decrypt } from '@typebot.io/lib/api'
import { defaultFrom, defaultTransportOptions } from './constants'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'
import { findUniqueVariableValue } from '../../../variables/findUniqueVariableValue'

export const executeSendEmailBlock = async (
  { result, typebot }: SessionState,
  block: SendEmailBlock
): Promise<ExecuteIntegrationResponse> => {
  const { options } = block
  const { variables } = typebot
  const isPreview = !result.id
  if (isPreview)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: 'info',
          description: 'Emails are not sent in preview mode',
        },
      ],
    }

  const body =
    findUniqueVariableValue(variables)(options.body)?.toString() ??
    parseVariables(variables, { escapeHtml: true })(options.body ?? '')

  try {
    await sendEmail({
      typebotId: typebot.id,
      result,
      credentialsId: options.credentialsId,
      recipients: options.recipients.map(parseVariables(variables)),
      subject: parseVariables(variables)(options.subject ?? ''),
      body,
      cc: (options.cc ?? []).map(parseVariables(variables)),
      bcc: (options.bcc ?? []).map(parseVariables(variables)),
      replyTo: options.replyTo
        ? parseVariables(variables)(options.replyTo)
        : undefined,
      fileUrls: getFileUrls(variables)(options.attachmentsVariableId),
      isCustomBody: options.isCustomBody,
      isBodyCode: options.isBodyCode,
    })
  } catch (err) {
    await saveErrorLog({
      resultId: result.id,
      message: 'Email not sent',
      details: {
        error: err,
      },
    })
  }

  return { outgoingEdgeId: block.outgoingEdgeId }
}

const sendEmail = async ({
  typebotId,
  result,
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
  result: ResultInSession
  fileUrls?: string | string[]
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
    result,
  })

  if (!emailBody) {
    await saveErrorLog({
      resultId: result.id,
      message: 'Email not sent',
      details: {
        error: 'No email body found',
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
    attachments: fileUrls
      ? (typeof fileUrls === 'string' ? fileUrls.split(', ') : fileUrls).map(
          (url) => ({ path: url })
        )
      : undefined,
    ...emailBody,
  }
  try {
    await transporter.sendMail(email)
    await saveSuccessLog({
      resultId: result.id,
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
      resultId: result.id,
      message: 'Email not sent',
      details: {
        error: err,
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: '******' },
        },
        email,
      },
    })
  }
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
  result,
}: {
  typebotId: string
  result: ResultInSession
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
  const answers = parseAnswers(typebot, [])(result)
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

const getFileUrls =
  (variables: Variable[]) =>
  (variableId: string | undefined): string | string[] | undefined => {
    const fileUrls = variables.find(byId(variableId))?.value
    if (!fileUrls) return
    if (typeof fileUrls === 'string') return fileUrls
    return fileUrls.filter(isDefined)
  }
