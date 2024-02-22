import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { ZemanticAiResponse } from '../types'
import { got } from 'got'
import { apiBaseUrl } from '../constants'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'

export const searchDocuments = createAction({
  baseOptions,
  auth,
  name: 'Search documents',
  options: option.object({
    query: option.string.layout({
      label: 'Query',
      placeholder: 'Content',
      moreInfoTooltip:
        'The question you want to ask or search against the documents in the project.',
    }),
    maxResults: option.number.layout({
      label: 'Max results',
      placeholder: 'i.e. 3',
      defaultValue: 3,
      moreInfoTooltip:
        'The maximum number of document chunk results to return from your search.',
    }),
    systemPrompt: option.string.layout({
      accordion: 'Advanced settings',
      label: 'System prompt',
      moreInfoTooltip:
        'System prompt to send to the summarization LLM. This is prepended to the prompt and helps guide system behavior.',
      inputType: 'textarea',
    }),
    prompt: option.string.layout({
      accordion: 'Advanced settings',
      label: 'Prompt',
      moreInfoTooltip: 'Prompt to send to the summarization LLM.',
      inputType: 'textarea',
    }),
    responseMapping: option
      .saveResponseArray([
        'Summary',
        'Document IDs',
        'Texts',
        'Scores',
      ] as const)
      .layout({
        accordion: 'Save response',
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiKey },
      options: {
        maxResults,
        projectId,
        prompt,
        query,
        responseMapping,
        systemPrompt,
      },
      variables,
    }) => {
      const res: ZemanticAiResponse = await got
        .post(apiBaseUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          json: {
            projectId,
            query,
            maxResults,
            summarize: true,
            summaryOptions: {
              system_prompt: systemPrompt,
              prompt: prompt,
            },
          },
        })
        .json()

      responseMapping?.forEach((mapping) => {
        if (!mapping.variableId || !mapping.item) return

        if (mapping.item === 'Document IDs')
          variables.set(
            mapping.variableId,
            res.results.map((r) => r.documentId)
          )

        if (mapping.item === 'Texts')
          variables.set(
            mapping.variableId,
            res.results.map((r) => r.text)
          )

        if (mapping.item === 'Scores')
          variables.set(
            mapping.variableId,
            res.results.map((r) => r.score)
          )

        if (mapping.item === 'Summary')
          variables.set(mapping.variableId, res.summary)
      })
    },
  },
})
