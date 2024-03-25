import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { got } from 'got'
import {
  ApiResponse,
  SerpData,
  SerpDataPAA,
  SerpDataPAAElement,
} from '../types'
import { apiGetSerpData, apiUrl, getHeaders } from '../api'
import { fetchLanguages } from '../fetchers/fetch-languages'

export const getSerpData = createAction({
  auth,
  name: 'Get SERP Data',
  options: option.object({
    keyword: option.string.layout({
      label: 'Keyword',
      isRequired: true,
      helperText: 'Enter the keyword you want to get SERP data for.',
    }),
    location_name: option.string.layout({
      label: 'Location',
      isRequired: true,
      helperText:
        'Enter the geo location you want to get SERP data for. e.g. London, UK',
    }),
    search_param: option.string.layout({
      label: 'Search Parameters',
      isRequired: false,
      helperText: 'Enter additional search parameters.',
    }),

    language_code: option.string.layout({
      fetcher: 'languages',
      label: 'Language',
      placeholder: 'Select a language',
      defaultValue: 'en',
    }),
    responseMapping: option.saveResponseArray(['PAA Titles'] as const).layout({
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
      options: {
        keyword,
        responseMapping,
        language_code,
        search_param,
        location_name,
      },
      variables,
      logs,
    }) => {
      const request = [
        {
          keyword,
          search_param,
          language_code,
          location_name,
        },
      ]

      try {
        const response = await apiGetSerpData(
          apiLogin,
          apiKey,
          request,
          sandbox
        )

        // set result variables
        const taskResult = response.tasks[0].result[0]

        const peopleAlsoAsk: SerpDataPAA | undefined = taskResult.items.find(
          (i) => i.type === 'people_also_ask'
        )
        let paaTitles: string[] = []
        if (peopleAlsoAsk) {
          const paaItems = peopleAlsoAsk.items as SerpDataPAAElement[]
          paaTitles = paaItems.map((i) => i.title)
        }

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return
          const item = mapping.item ?? 'Data'
          if (item === 'Data') variables.set(mapping.variableId, taskResult)
          if (item === 'PAA Titles')
            variables.set(mapping.variableId, paaTitles)
        })
      } catch (error) {
        logs.add({
          status: 'error',
          description: 'DataForSEO-getSerpData: ' + (error as Error).message,
        })
        console.error('DataForSEO-getSerpData', error)
      }
    },
  },
})
