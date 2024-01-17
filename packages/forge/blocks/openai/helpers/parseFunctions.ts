import type { OpenAI } from 'openai'
import { options as createChatCompletionOption } from '../actions/createChatCompletion'
import { ReadOnlyVariableStore } from '@typebot.io/forge'
import { z } from '@typebot.io/forge/zod'

export const parseFunctions = ({
  options: { functions },
  variables,
}: {
  options: Pick<z.infer<typeof createChatCompletionOption>, 'functions'>
  variables: ReadOnlyVariableStore
}): OpenAI.ChatCompletionTool[] => {
  return (
    functions?.map(({ name, description, parameters }) => ({
      type: 'function',
      function: {
        name: name ?? 'function',
        description,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            new Map(
              parameters?.map(({ name, type, description }) => [
                name,
                {
                  type,
                  description,
                },
              ])
            )
          ),
          required:
            parameters
              ?.filter((param) => param.required)
              .map((param) => param.name) ?? [],
        },
      },
    })) ?? []
  )
}


