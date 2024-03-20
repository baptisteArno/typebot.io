import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { got } from 'got'
import { KeywordDataResponse, KeywordData, LanguageData } from '../types'

const baseUrl = (sandbox = false) =>
  `https://${sandbox ? 'sandbox' : 'api'}.dataforseo.com/v3/keywords_data`

const getHeaders = (apiLogin?: string, apiKey?: string) => {
  const encodedAuth = btoa(`${apiLogin}:${apiKey}`)
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${encodedAuth}`,
  }
}

export const getKeywordData = createAction({
  auth,
  name: 'Get Keyword Data',
  options: option.object({
    keyword: option.string.layout({
      label: 'Keyword',
      isRequired: true,
      helperText: 'Enter the keyword you want to get SEO data for.',
    }),
    language_code: option.string.layout({
      fetcher: 'languages',
      label: 'Language',
      placeholder: 'Select a language',
      defaultValue: 'en',
    }),
    responseMapping: option
      .saveResponseArray([
        'Data',
        'Search Volume',
        'CPC',
        'Competition Index',
        'Competition',
      ] as const)
      .layout({
        accordion: 'Save Result',
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  fetchers: [
    {
      id: 'languages',
      fetch: async ({ credentials: { apiLogin, apiKey, sandbox } }) => {
        const response = await got
          .get(baseUrl(sandbox) + '/google_ads/languages', {
            headers: getHeaders(apiLogin, apiKey),
          })
          .json<KeywordDataResponse<LanguageData>>()

        return response.tasks[0].result.map((languge) => ({
          value: languge.language_code,
          label: languge.language_name,
        }))
      },
      dependencies: [],
    },
  ],
  run: {
    server: async ({
      credentials: { apiKey, apiLogin, sandbox },
      options: { keyword, responseMapping, language_code },
      variables,
      logs,
    }) => {
      const data = [
        {
          search_partners: false,
          keywords: [keyword],
          language_code,
          sort_by: 'relevance',
        },
      ]

      try {
        const r = await got.post(
          `${baseUrl(sandbox)}/google_ads/search_volume/live`,
          {
            headers: getHeaders(apiLogin, apiKey),
            json: data,
          }
        )
        const response = JSON.parse(r.body) as KeywordDataResponse<KeywordData>

        if (response.status_code !== 20000) {
          logs.add({
            status: 'error',
            description: 'DataForSEO-API: ' + response.status_message,
          })
          return
        }

        if (response.tasks.length == 0) {
          logs.add({
            status: 'error',
            description: 'DataForSEO-API: No tasks found',
          })
          return
        }

        if (response.tasks[0].status_code !== 20000) {
          logs.add({
            status: 'error',
            description: 'DataForSEO-API: ' + response.tasks[0].status_message,
          })
          return
        }

        // set result variables
        const taskResult = response.tasks[0].result[0]
        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return
          const item = mapping.item ?? 'Data'
          if (item === 'Data') variables.set(mapping.variableId, taskResult)
          if (item === 'Search Volume')
            variables.set(mapping.variableId, taskResult.search_volume)
          if (item === 'CPC') variables.set(mapping.variableId, taskResult.cpc)
          if (item === 'Competition Index')
            variables.set(mapping.variableId, taskResult.competition_index)
          if (item === 'Competition')
            variables.set(mapping.variableId, taskResult.competition)
        })
      } catch (error) {
        logs.add({
          status: 'error',
          description: 'DataForSEO-getKeywordData: ' + (error as Error).message,
        })
        console.error('DataForSEO-getKeywordData', error)
      }
    },
  },
})
