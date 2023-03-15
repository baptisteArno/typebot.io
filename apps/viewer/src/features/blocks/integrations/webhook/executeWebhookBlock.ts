import prisma from '@/lib/prisma'
import {
  WebhookBlock,
  ZapierBlock,
  MakeComBlock,
  PabblyConnectBlock,
  VariableWithUnknowValue,
  SessionState,
  Webhook,
  Typebot,
  Variable,
  WebhookResponse,
  WebhookOptions,
  defaultWebhookAttributes,
  HttpMethod,
  PublicTypebot,
  KeyValue,
  ReplyLog,
  ResultInSession,
} from '@typebot.io/schemas'
import { stringify } from 'qs'
import { byId, omit } from '@typebot.io/lib'
import { parseAnswers } from '@typebot.io/lib/results'
import got, { Method, Headers, HTTPError } from 'got'
import { parseSampleResult } from './parseSampleResult'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'

export const executeWebhookBlock = async (
  state: SessionState,
  block: WebhookBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock
): Promise<ExecuteIntegrationResponse> => {
  const { typebot, result } = state
  let log: ReplyLog | undefined
  const webhook = (await prisma.webhook.findUnique({
    where: { id: block.webhookId },
  })) as Webhook | null
  if (!webhook) {
    log = {
      status: 'error',
      description: `Couldn't find webhook with id ${block.webhookId}`,
    }
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: log.description,
      }))
    return { outgoingEdgeId: block.outgoingEdgeId, logs: [log] }
  }
  const preparedWebhook = prepareWebhookAttributes(webhook, block.options)
  const webhookResponse = await executeWebhook({ typebot })(
    preparedWebhook,
    typebot.variables,
    block.groupId,
    result
  )
  const status = webhookResponse.statusCode.toString()
  const isError = status.startsWith('4') || status.startsWith('5')

  if (isError) {
    log = {
      status: 'error',
      description: `Webhook returned error: ${webhookResponse.data}`,
      details: JSON.stringify(webhookResponse.data, null, 2).substring(0, 1000),
    }
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: log.description,
        details: log.details,
      }))
  } else {
    log = {
      status: 'success',
      description: `Webhook executed successfully!`,
      details: JSON.stringify(webhookResponse.data, null, 2).substring(0, 1000),
    }
    result &&
      (await saveSuccessLog({
        resultId: result.id,
        message: log.description,
        details: JSON.stringify(webhookResponse.data, null, 2).substring(
          0,
          1000
        ),
      }))
  }

  const newVariables = block.options.responseVariableMapping.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
    const existingVariable = typebot.variables.find(byId(varMapping.variableId))
    if (!existingVariable) return newVariables
    const func = Function(
      'data',
      `return data.${parseVariables(typebot.variables)(varMapping?.bodyPath)}`
    )
    try {
      const value: unknown = func(webhookResponse)
      return [...newVariables, { ...existingVariable, value }]
    } catch (err) {
      return newVariables
    }
  }, [])
  if (newVariables.length > 0) {
    const newSessionState = await updateVariables(state)(newVariables)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState,
    }
  }

  return { outgoingEdgeId: block.outgoingEdgeId, logs: log ? [log] : undefined }
}

const prepareWebhookAttributes = (
  webhook: Webhook,
  options: WebhookOptions
): Webhook => {
  if (options.isAdvancedConfig === false) {
    return { ...webhook, body: '{{state}}', ...defaultWebhookAttributes }
  } else if (options.isCustomBody === false) {
    return { ...webhook, body: '{{state}}' }
  }
  return webhook
}

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body)

export const executeWebhook =
  ({ typebot }: Pick<SessionState, 'typebot'>) =>
  async (
    webhook: Webhook,
    variables: Variable[],
    groupId: string,
    result: ResultInSession
  ): Promise<WebhookResponse> => {
    if (!webhook.url || !webhook.method)
      return {
        statusCode: 400,
        data: { message: `Webhook doesn't have url or method` },
      }
    const basicAuth: { username?: string; password?: string } = {}
    const basicAuthHeaderIdx = webhook.headers.findIndex(
      (h) =>
        h.key?.toLowerCase() === 'authorization' &&
        h.value?.toLowerCase()?.includes('basic')
    )
    const isUsernamePasswordBasicAuth =
      basicAuthHeaderIdx !== -1 &&
      webhook.headers[basicAuthHeaderIdx].value?.includes(':')
    if (isUsernamePasswordBasicAuth) {
      const [username, password] =
        webhook.headers[basicAuthHeaderIdx].value?.slice(6).split(':') ?? []
      basicAuth.username = username
      basicAuth.password = password
      webhook.headers.splice(basicAuthHeaderIdx, 1)
    }
    const headers = convertKeyValueTableToObject(webhook.headers, variables) as
      | Headers
      | undefined
    const queryParams = stringify(
      convertKeyValueTableToObject(webhook.queryParams, variables)
    )
    const contentType = headers ? headers['Content-Type'] : undefined

    const bodyContent = await getBodyContent(
      typebot,
      []
    )({
      body: webhook.body,
      result,
      groupId,
      variables,
    })
    const { data: body, isJson } =
      bodyContent && webhook.method !== HttpMethod.GET
        ? safeJsonParse(
            parseVariables(variables, {
              escapeForJson: !checkIfBodyIsAVariable(bodyContent),
            })(bodyContent)
          )
        : { data: undefined, isJson: false }

    const request = {
      url: parseVariables(variables)(
        webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
      ),
      method: webhook.method as Method,
      headers,
      ...basicAuth,
      json:
        !contentType?.includes('x-www-form-urlencoded') && body && isJson
          ? body
          : undefined,
      form:
        contentType?.includes('x-www-form-urlencoded') && body
          ? body
          : undefined,
      body: body && !isJson ? body : undefined,
    }
    try {
      const response = await got(request.url, omit(request, 'url'))
      await saveSuccessLog({
        resultId: result.id,
        message: 'Webhook successfuly executed.',
        details: {
          statusCode: response.statusCode,
          request,
          response: safeJsonParse(response.body).data,
        },
      })
      return {
        statusCode: response.statusCode,
        data: safeJsonParse(response.body).data,
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        const response = {
          statusCode: error.response.statusCode,
          data: safeJsonParse(error.response.body as string).data,
        }
        await saveErrorLog({
          resultId: result.id,
          message: 'Webhook returned an error',
          details: {
            request,
            response,
          },
        })
        return response
      }
      const response = {
        statusCode: 500,
        data: { message: `Error from Typebot server: ${error}` },
      }
      console.error(error)
      await saveErrorLog({
        resultId: result.id,
        message: 'Webhook failed to execute',
        details: {
          request,
          response,
        },
      })
      return response
    }
  }

const getBodyContent =
  (
    typebot: Pick<Typebot | PublicTypebot, 'groups' | 'variables' | 'edges'>,
    linkedTypebots: (Typebot | PublicTypebot)[]
  ) =>
  async ({
    body,
    result,
    groupId,
    variables,
  }: {
    body?: string | null
    result?: ResultInSession
    groupId: string
    variables: Variable[]
  }): Promise<string | undefined> => {
    if (!body) return
    return body === '{{state}}'
      ? JSON.stringify(
          result
            ? parseAnswers(typebot, linkedTypebots)(result)
            : await parseSampleResult(typebot, linkedTypebots)(
                groupId,
                variables
              )
        )
      : body
  }

const convertKeyValueTableToObject = (
  keyValues: KeyValue[] | undefined,
  variables: Variable[]
) => {
  if (!keyValues) return
  return keyValues.reduce((object, item) => {
    if (!item.key) return {}
    return {
      ...object,
      [item.key]: parseVariables(variables)(item.value ?? ''),
    }
  }, {})
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJsonParse = (json: string): { data: any; isJson: boolean } => {
  try {
    return { data: JSON.parse(json), isJson: true }
  } catch (err) {
    return { data: json, isJson: false }
  }
}
