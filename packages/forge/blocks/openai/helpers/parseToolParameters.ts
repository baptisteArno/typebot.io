import type { OpenAI } from 'openai'
import { parameterSchema } from '../actions/createChatCompletion'
import { z } from '@typebot.io/forge/zod'

export const parseToolParameters = (
  parameters: z.infer<typeof parameterSchema>[]
): OpenAI.FunctionParameters => ({
  type: 'object',
  properties: parameters?.reduce<{
    [x: string]: unknown
  }>((acc, param) => {
    if (!param.name) return acc
    acc[param.name] = {
      type: param.type,
      description: param.description,
    }
    return acc
  }, {}),
  required:
    parameters?.filter((param) => param.required).map((param) => param.name) ??
    [],
})
