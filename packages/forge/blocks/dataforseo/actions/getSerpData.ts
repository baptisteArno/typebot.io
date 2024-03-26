import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { SerpDataPAA, SerpDataPAAElement } from '../types'
import { apiGetSerpData } from '../api'
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
    language_code: option.string.layout({
      fetcher: 'languages',
      label: 'Language',
      isRequired: true,
      helperText: 'Select a language',
      defaultValue: 'en',
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
        await fetchLanguages(apiLogin, apiKey, sandbox),
      dependencies: [],
    },
  ],
  run: {
    server: async ({
      credentials: { apiKey, apiLogin, sandbox },
      options: {
        keyword,
        language_code,
        location_name,
        search_param,
        responseMapping,
      },
      variables,
      logs,
    }) => {
      const request = [
        {
          keyword,
          language_code,
          location_name,
          search_param,
        },
      ]

      console.log('getSERPdata request', request)

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
        } else {
          logs.add({
            status: 'error',
            description: 'DataForSEO-getSerpData: PAA element not present',
          })
          console.error('DataForSEO-getSerpData: PAA element not present')
        }

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return
          const item = mapping.item
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
