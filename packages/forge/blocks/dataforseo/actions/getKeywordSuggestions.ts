import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { apiGetKeywordSuggestions } from '../api'
import { fetchLanguages } from '../fetchers/fetch-languages'

export const getKeywordSuggestions = createAction({
  auth,
  name: 'Get Keyword Suggestions',
  options: option.object({
    keyword: option.string.layout({
      label: 'Keyword',
      isRequired: true,
      helperText: 'Enter the keyword you want to get SEO data for.',
    }),
    location_name: option.string.layout({
      label: 'Location',
      isRequired: false,
      helperText: 'Enter the location. E.g. London, UK',
    }),

    language_code: option.string.layout({
      fetcher: 'languages',
      label: 'Language',
      placeholder: 'Select a language',
      defaultValue: 'en',
    }),
    responseMapping: option.saveResponseArray(['Suggestions'] as const).layout({
      accordion: 'Save Result',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  fetchers: [
    {
      id: 'languages',
      fetch: async ({ credentials: { apiLogin, apiKey, sandbox } }) =>
        fetchLanguages(apiLogin, apiKey, sandbox),
      dependencies: [],
    },
  ],
  run: {
    server: async ({
      credentials: { apiKey, apiLogin, sandbox },
      options: { keyword, responseMapping, language_code, location_name },
      variables,
      logs,
    }) => {
      const request = [
        {
          search_partners: false,
          keyword,
          location_name,
          language_code,
          order_by: [
            'keyword_info.search_volume,desc',
            'keyword_info.cpc,desc',
          ],
        },
      ]

      try {
        const response = await apiGetKeywordSuggestions(
          apiLogin,
          apiKey,
          request,
          sandbox
        )

        // set result variables
        const taskResult = response.tasks[0].result[0]
        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return
          const item = mapping.item
          if (item === 'Suggestions') {
            const s = taskResult.items.map((item) => item.keyword)
            variables.set(mapping.variableId, s)
          }
        })
      } catch (error) {
        logs.add({
          status: 'error',
          description:
            'DataForSEO-getKeywordSuggestions: ' + (error as Error).message,
        })
        console.error('DataForSEO-getKeywordSuggestions', error)
      }
    },
  },
})
