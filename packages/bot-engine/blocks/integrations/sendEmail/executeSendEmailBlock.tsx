import { DefaultBotNotificationEmail, render } from '@sniper.io/emails'
import {
  AnswerInSessionState,
  ChatLog,
  SendEmailBlock,
  SessionState,
  SmtpCredentials,
  SniperInSession,
  Variable,
} from '@sniper.io/schemas'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { byId, isDefined, isEmpty, isNotDefined, omit } from '@sniper.io/lib'
import { decrypt } from '@sniper.io/lib/api/encryption/decrypt'
import { defaultFrom, defaultTransportOptions } from './constants'
import { findUniqueVariableValue } from '@sniper.io/variables/findUniqueVariableValue'
import { env } from '@sniper.io/env'
import { ExecuteIntegrationResponse } from '../../../types'
import prisma from '@sniper.io/lib/prisma'
import { parseVariables } from '@sniper.io/variables/parseVariables'
import { defaultSendEmailOptions } from '@sniper.io/schemas/features/blocks/integrations/sendEmail/constants'
import { parseAnswers } from '@sniper.io/results/parseAnswers'

export const sendEmailSuccessDescription = 'Email successfully sent'
export const sendEmailErrorDescription = 'Email not sent'

export const executeSendEmailBlock = async (
  state: SessionState,
  block: SendEmailBlock
): Promise<ExecuteIntegrationResponse> => {
  const logs: ChatLog[] = []
  const { options } = block
  const { sniper, resultId, answers } = state.snipersQueue[0]
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

  const bodyUniqueVariable = findUniqueVariableValue(sniper.variables)(
    options?.body
  )
  const body = bodyUniqueVariable
    ? stringifyUniqueVariableValueAsHtml(bodyUniqueVariable)
    : parseVariables(sniper.variables, { isInsideHtml: !options?.isBodyCode })(
        options?.body ?? ''
      )

  if (!options?.recipients)
    return { outgoingEdgeId: block.outgoingEdgeId, logs }

  try {
    const sendEmailLogs = await sendEmail({
      sniper,
      answers,
      credentialsId:
        options.credentialsId ?? defaultSendEmailOptions.credentialsId,
      recipients: options.recipients.map(parseVariables(sniper.variables)),
      subject: options.subject
        ? parseVariables(sniper.variables)(options?.subject)
        : undefined,
      body,
      cc: options.cc
        ? options.cc.map(parseVariables(sniper.variables))
        : undefined,
      bcc: options.bcc
        ? options.bcc.map(parseVariables(sniper.variables))
        : undefined,
      replyTo: options.replyTo
        ? parseVariables(sniper.variables)(options.replyTo)
        : undefined,
      fileUrls: getFileUrls(sniper.variables)(options.attachmentsVariableId),
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
  sniper,
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
}: {
  credentialsId: string
  recipients: string[]
  body: string | undefined
  subject: string | undefined
  cc: string[] | undefined
  bcc: string[] | undefined
  replyTo: string | undefined
  isBodyCode: boolean | undefined
  isCustomBody: boolean | undefined
  sniper: SniperInSession
  answers: AnswerInSessionState[]
  fileUrls?: string | string[]
}): Promise<ChatLog[] | undefined> => {
  const logs: ChatLog[] = []
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
    sniper,
    answersInSession: answers,
  })

  if (!emailBody) {
    logs.push({
      status: 'error',
      description: sendEmailErrorDescription,
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
      description: sendEmailSuccessDescription,
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
      description: sendEmailErrorDescription,
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
  sniper,
  answersInSession,
}: {
  sniper: SniperInSession
  answersInSession: AnswerInSessionState[]
} & Pick<
  NonNullable<SendEmailBlock['options']>,
  'isCustomBody' | 'isBodyCode' | 'body'
>): Promise<{ html?: string; text?: string } | undefined> => {
  if (isCustomBody || (isNotDefined(isCustomBody) && !isEmpty(body)))
    return {
      html: isBodyCode ? body : undefined,
      text: !isBodyCode ? body : undefined,
    }
  const answers = parseAnswers({
    variables: sniper.variables,
    answers: answersInSession,
  })
  return {
    html: render(
      <DefaultBotNotificationEmail
        resultsUrl={`${env.NEXTAUTH_URL}/snipers/${sniper.id}/results`}
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
