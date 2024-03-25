import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { apiGetSearchVolume } from '../api'
import { fetchLanguages } from '../fetchers/fetch-languages'

export const getSearchVolumeData = createAction({
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
      fetch: async ({ credentials: { apiLogin, apiKey, sandbox } }) =>
        fetchLanguages(apiLogin, apiKey, sandbox),
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
      const request = [
        {
          search_partners: false,
          keywords: [keyword],
          language_code,
          sort_by: 'relevance',
        },
      ]

      try {
        const response = await apiGetSearchVolume(
          apiLogin,
          apiKey,
          request,
          sandbox
        )

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
          description:
            'DataForSEO-getSearchVolumeData: ' + (error as Error).message,
        })
        console.error('DataForSEO-getSearchVolumeData', error)
      }
    },
  },
})
