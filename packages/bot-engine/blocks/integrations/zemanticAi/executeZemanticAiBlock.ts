import { SessionState } from '@typebot.io/schemas'
import {
  ZemanticAiBlock,
  ZemanticAiCredentials,
  ZemanticAiResponse,
} from '@typebot.io/schemas/features/blocks/integrations/zemanticAi'
import got from 'got'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { byId, isDefined, isEmpty } from '@typebot.io/lib'
import { getDefinedVariables, parseAnswers } from '@typebot.io/lib/results'
import prisma from '@typebot.io/lib/prisma'
import { ExecuteIntegrationResponse } from '../../../types'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'

const URL = 'https://api.zemantic.ai/v1/search-documents'

export const executeZemanticAiBlock = async (
  state: SessionState,
  block: ZemanticAiBlock
): Promise<ExecuteIntegrationResponse> => {
  let newSessionState = state

  if (!block.options?.credentialsId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    }

  const credentials = await prisma.credentials.findUnique({
    where: {
      id: block.options?.credentialsId,
    },
  })

  if (!credentials) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: 'Make sure to select a Zemantic AI account',
        },
      ],
    }
  }
  const { apiKey } = (await decrypt(
    credentials.data,
    credentials.iv
  )) as ZemanticAiCredentials['data']

  const { typebot, answers } = newSessionState.typebotsQueue[0]

  const templateVars = parseAnswers({
    variables: getDefinedVariables(typebot.variables),
    answers: answers,
  })

  try {
    const res: ZemanticAiResponse = await got
      .post(URL, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        json: {
          projectId: block.options.projectId,
          query: replaceTemplateVars(
            block.options.query as string,
            templateVars
          ),
          maxResults: block.options.maxResults,
          summarize: true,
          summaryOptions: {
            system_prompt:
              replaceTemplateVars(
                block.options.systemPrompt as string,
                templateVars
              ) ?? '',
            prompt:
              replaceTemplateVars(
                block.options.prompt as string,
                templateVars
              ) ?? '',
          },
        },
      })
      .json()

    for (const r of block.options.responseMapping || []) {
      const variable = typebot.variables.find(byId(r.variableId))
      switch (r.valueToExtract) {
        case 'Summary':
          if (isDefined(variable) && !isEmpty(res.summary)) {
            newSessionState = updateVariablesInSession(newSessionState)([
              { ...variable, value: res.summary },
            ])
          }
          break
        case 'Results':
          if (isDefined(variable) && res.results.length) {
            newSessionState = updateVariablesInSession(newSessionState)([
              { ...variable, value: JSON.stringify(res.results) },
            ])
          }
          break
        default:
          break
      }
    }
  } catch (e) {
    console.error(e)
    return {
      startTimeShouldBeUpdated: true,
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: 'Could not execute Zemantic AI request',
        },
      ],
    }
  }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState,
    startTimeShouldBeUpdated: true,
  }
}

const replaceTemplateVars = (
  template: string,
  vars: Record<string, string>
) => {
  if (!template) return
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}
