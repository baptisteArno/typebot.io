import type { OpenAI } from 'openai'
import { toolParametersSchema } from '../shared/parseChatCompletionOptions'
import { z } from '@typebot.io/forge/zod'

export const parseToolParameters = (
  parameters: z.infer<typeof toolParametersSchema> | undefined
): OpenAI.FunctionParameters => ({
  type: 'object',
  properties:
    parameters?.reduce((acc, param) => {
      if (!param.name) return acc
      acc[param.name] = {
        type: param.type === 'enum' ? 'string' : param.type,
        enum: param.type === 'enum' ? param.values : undefined,
        description: param.description,
      }
      return acc
    }, {} as Record<string, any>) ?? {},
  required:
    parameters?.filter((param) => param.required).map((param) => param.name) ??
    [],
})
