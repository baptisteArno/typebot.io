import { parseVariables } from '@/features/variables/parseVariables'
import prisma from '@/lib/prisma'
import { render } from '@faire/mjml-react/utils/render'
import { DefaultBotNotificationEmail } from '@typebot.io/emails'
import {
  AnswerInSessionState,
  ReplyLog,
  SendEmailBlock,
  SendEmailOptions,
  SessionState,
  SmtpCredentials,
  TypebotInSession,
  Variable,
} from '@typebot.io/schemas'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { byId, isDefined, isEmpty, isNotDefined, omit } from '@typebot.io/lib'
import { getDefinedVariables, parseAnswers } from '@typebot.io/lib/results'
import { decrypt } from '@typebot.io/lib/api'
import { defaultFrom, defaultTransportOptions } from './constants'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { findUniqueVariableValue } from '../../../variables/findUniqueVariableValue'
import { env } from '@typebot.io/env'

export const executeSendEmailBlock = async (
  state: SessionState,
  block: SendEmailBlock
): Promise<ExecuteIntegrationResponse> => {
  const logs: ReplyLog[] = []
  const { options } = block
  const { typebot, resultId, answers } = state.typebotsQueue[0]
  const isPreview = !resultId
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

  const bodyUniqueVariable = findUniqueVariableValue(typebot.variables)(
    options.body
  )
  const body = bodyUniqueVariable
    ? stringifyUniqueVariableValueAsHtml(bodyUniqueVariable)
    : parseVariables(typebot.variables, { isInsideHtml: true })(
        options.body ?? ''
      )

  try {
    const sendEmailLogs = await sendEmail({
      typebot,
      answers,
      credentialsId: options.credentialsId,
      recipients: options.recipients.map(parseVariables(typebot.variables)),
      subject: parseVariables(typebot.variables)(options.subject ?? ''),
      body,
      cc: (options.cc ?? []).map(parseVariables(typebot.variables)),
      bcc: (options.bcc ?? []).map(parseVariables(typebot.variables)),
      replyTo: options.replyTo
        ? parseVariables(typebot.variables)(options.replyTo)
        : undefined,
      fileUrls: getFileUrls(typebot.variables)(options.attachmentsVariableId),
      isCustomBody: options.isCustomBody,
      isBodyCode: options.isBodyCode,
    })
    if (sendEmailLogs) logs.push(...sendEmailLogs)
  } catch (err) {
    logs.push({
      status: 'error',
      details: err,
      description: `Email not sent`,
    })
  }

  return { outgoingEdgeId: block.outgoingEdgeId, logs }
}

const sendEmail = async ({
  typebot,
  answers,
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
  typebot: TypebotInSession
  answers: AnswerInSessionState[]
  fileUrls?: string | string[]
}): Promise<ReplyLog[] | undefined> => {
  const logs: ReplyLog[] = []
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
    typebot,
    answersInSession: answers,
  })

  if (!emailBody) {
    logs.push({
      status: 'error',
      description: 'Email not sent',
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
    return logs
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
    logs.push({
      status: 'success',
      description: 'Email successfully sent',
      details: {
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: '******' },
        },
        email,
      },
    })
  } catch (err) {
    logs.push({
      status: 'error',
      description: 'Email not sent',
      details: {
        error: err instanceof Error ? err.toString() : err,
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: '******' },
        },
        email,
      },
    })
  }

  return logs
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
  return (await decrypt(
    credentials.data,
    credentials.iv
  )) as SmtpCredentials['data']
}

const getEmailBody = async ({
  body,
  isCustomBody,
  isBodyCode,
  typebot,
  answersInSession,
}: {
  typebot: TypebotInSession
  answersInSession: AnswerInSessionState[]
} & Pick<SendEmailOptions, 'isCustomBody' | 'isBodyCode' | 'body'>): Promise<
  { html?: string; text?: string } | undefined
> => {
  if (isCustomBody || (isNotDefined(isCustomBody) && !isEmpty(body)))
    return {
      html: isBodyCode ? body : undefined,
      text: !isBodyCode ? body : undefined,
    }
  const answers = parseAnswers({
    variables: getDefinedVariables(typebot.variables),
    answers: answersInSession,
  })
  return {
    html: render(
      <DefaultBotNotificationEmail
        resultsUrl={`${env.NEXTAUTH_URL}/typebots/${typebot.id}/results`}
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

const stringifyUniqueVariableValueAsHtml = (
  value: Variable['value']
): string => {
  if (!value) return ''
  if (typeof value === 'string') return value.replace(/\n/g, '<br />')
  return value.map(stringifyUniqueVariableValueAsHtml).join('<br />')
}
