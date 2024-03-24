import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { got } from 'got'
import { SerpResponse } from '../types'
import { getLanguages } from '../get-languages'
import { getCountries } from '../get-countries'

const baseUrl = 'https://api.frase.io/api/v1/process_serp'

const getHeaders = (apiKey?: string) => {
  return {
    'Content-Type': 'application/json',
    token: `${apiKey}`,
  }
}

export const processSerp = createAction({
  auth,
  name: 'Process SERP',
  options: option.object({
    query: option.string.layout({
      label: 'Google Query',
      isRequired: true,
      helperText: 'Enter the query to search for.',
    }),
    user_url: option.string.layout({
      accordion: 'Advanced Options',
      label: 'URL to compare',
      isRequired: false,
    }),

    count: option.string.layout({
      label: 'Search result count',
      accordion: 'Advanced Options',
      isRequired: true,
      helperText: 'Number of search results to process.',
      defaultValue: '20',
    }),

    language_code: option.string.layout({
      label: 'Language',
      accordion: 'Advanced Options',
      placeholder: 'Select a language',
      defaultValue: 'en',
      fetcher: 'languages',
    }),
    country_code: option.string.layout({
      label: 'Country',
      accordion: 'Advanced Options',
      placeholder: 'Select a country',
      defaultValue: 'us',
      fetcher: 'countries',
    }),
    responseMapping: option
      .saveResponseArray([
        'Titles',
        'URLs',
        'Average Word Count',
        'Average Header Count',
        'Average Ext.Links Count',
        'Average Score',
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
      fetch: async ({ credentials: { apiKey } }) => {
        const response = getLanguages()
        return response.map((l) => ({
          value: l.code,
          label: l.name,
        }))
      },
      dependencies: [],
    },
    {
      id: 'countries',
      fetch: async ({ credentials: { apiKey } }) => {
        const response = getCountries()
        return response.map((c) => ({
          value: c.code,
          label: c.name,
        }))
      },
      dependencies: [],
    },
  ],
  run: {
    server: async ({
      credentials: { apiKey },
      options: {
        query,
        count,
        language_code,
        country_code,
        responseMapping,
        user_url,
      },
      variables,
      logs,
    }) => {
      const request = {
        query,
        lang: language_code,
        country: country_code,
        count: parseInt(count ?? '20'),
        include_full_text: false,
        user_url,
      }

      try {
        console.log('Request', request)
        const r = await got.post(`${baseUrl}`, {
          headers: getHeaders(apiKey),
          json: request,
        })
        if (r.statusCode !== 200) {
          logs.add({
            status: 'error',
            description: 'Frase.io-API: response ' + r.statusCode,
          })
          return
        }
        const response = JSON.parse(r.body) as SerpResponse

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return
          const item = mapping.item ?? 'Titles'
          if (item === 'Titles')
            variables.set(
              mapping.variableId,
              response.items.map((item) => item.title)
            )
          if (item === 'URLs')
            variables.set(
              mapping.variableId,
              response.items.map((item) => item.url)
            )
          if (item === 'Average Word Count')
            variables.set(
              mapping.variableId,
              response.aggregate_metrics.avg_word_count
            )
          if (item === 'Average Header Count')
            variables.set(
              mapping.variableId,
              response.aggregate_metrics.avg_headers
            )
          if (item === 'Average Ext.Links Count')
            variables.set(
              mapping.variableId,
              response.aggregate_metrics.avg_external_links
            )
          if (item === 'Average Score')
            variables.set(
              mapping.variableId,
              response.aggregate_metrics.avg_score
            )
        })
      } catch (error) {
        logs.add({
          status: 'error',
          description: 'Frase.io-processSERP: ' + (error as Error).message,
        })
        console.error('Frase.io-processSERP', error)
      }
    },
  },
})
