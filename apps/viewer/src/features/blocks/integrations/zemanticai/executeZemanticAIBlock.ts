import { ExecuteIntegrationResponse } from 'zR@/features/chat/types'
import prisma from '@/lib/prisma'
import { SessionState } from '@typebot.io/schemas'
import {
  ZemanticAIBlock,
  ZemanticAICredentials,
} from '@typebot.io/schemas/features/blocks/integrations/zemanticai'
import got from 'got'
import { decrypt } from '@typebot.io/lib/api/encryption'
import { byId, isDefined, isEmpty } from '@typebot.io/lib'
import { updateVariables } from '@/features/variables/updateVariables'

const URL = 'https://api.zemantic.ai/v1/search-documents'

export const executeZemanticAIBlock = async (
  state: SessionState,
  block: ZemanticAIBlock
): Promise<ExecuteIntegrationResponse> => {
  const newSessionState = state
  const noCredentialsError = {
    status: 'error',
    description: 'Make sure to select a Zemantic AI account',
  }

  const credentials = await prisma.credentials.findUnique({
    where: {
      id: block.options.credentialsId,
    },
  })
  if (!credentials) {
    console.error('Could not find credentials in database')
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [noCredentialsError],
    }
  }
  const { apiKey } = (await decrypt(
    credentials.data,
    credentials.iv
  )) as ZemanticAICredentials['data']

  const { typebot } = newSessionState.typebotsQueue[0]
  const variableToSave = typebot.variables.find(
    byId(block.options.variableToSave)
  )

  try {
    const res = await got
      .post(URL, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        json: {
          projectId: block.options.projectId,
          query: block.options.query,
          summarize: true,
          summaryOptions: {
            system_prompt: block.options.systemPrompt,
            prompt: block.options.prompt,
          },
        },
      })
      .json()

    console.log(res)

    if (isDefined(variableToSave) && !isEmpty(res.summary)) {
      updateVariables(newSessionState)([
        { ...variableToSave, value: res.summary },
      ])
    }

    console.log(newSessionState)
  } catch (e) {
    console.log('nope')
    console.error(e)
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  return { outgoingEdgeId: block.outgoingEdgeId, newSessionState, logs: [] }
}
