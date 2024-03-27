import { HTTPError, got } from 'got'
import { ApiResponse, KeywordInfo, KeywordSuggestion, SerpData } from './types'

export const apiUrl = (uri: string, sandbox = false) =>
  `https://${sandbox ? 'sandbox' : 'api'}.dataforseo.com/v3/${uri}`

export const getHeaders = (apiLogin?: string, apiKey?: string) => {
  const encodedAuth = btoa(`${apiLogin}:${apiKey}`)
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${encodedAuth}`,
  }
}

export async function apiGetSearchVolume(
  apiLogin: string | undefined,
  apiKey: string | undefined,
  request: any,
  sandbox = false
) {
  try {
    const r = await got.post(
      apiUrl('keywords_data/google_ads/search_volume/live', sandbox),
      {
        headers: getHeaders(apiLogin, apiKey),
        json: request,
      }
    )
    const response = JSON.parse(r.body) as ApiResponse<KeywordInfo>
    processStandardErrors(response)
    return response
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(
        'API: response (' +
          error.response.statusCode +
          ') ' +
          error.response.body
      )
    } else {
      throw new Error('API: request ' + (error as Error).message)
    }
  }
}

export async function apiGetSerpData(
  apiLogin: string | undefined,
  apiKey: string | undefined,
  request: any,
  sandbox = false
) {
  try {
    const r = await got.post(
      apiUrl('serp/google/organic/live/advanced', sandbox),
      {
        headers: getHeaders(apiLogin, apiKey),
        json: request,
      }
    )
    const response = JSON.parse(r.body) as ApiResponse<SerpData>
    processStandardErrors(response)
    return response
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(
        'API: response (' +
          error.response.statusCode +
          ') ' +
          error.response.body
      )
    } else {
      throw new Error('API: request ' + (error as Error).message)
    }
  }
}

export async function apiGetKeywordSuggestions(
  apiLogin: string | undefined,
  apiKey: string | undefined,
  request: any,
  sandbox = false
) {
  try {
    const r = await got.post(
      apiUrl('dataforseo_labs/google/keyword_suggestions/live', sandbox),
      {
        headers: getHeaders(apiLogin, apiKey),
        json: request,
      }
    )
    const response = JSON.parse(r.body) as ApiResponse<KeywordSuggestion>
    processStandardErrors(response)
    return response
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(
        'API: response (' +
          error.response.statusCode +
          ') ' +
          error.response.body
      )
    } else {
      throw new Error('API: request ' + (error as Error).message)
    }
  }
}

function processStandardErrors(response: ApiResponse<any>) {
  if (response.status_code !== 20000) {
    throw new Error('API: ' + response.status_message)
  }

  if (response.tasks.length == 0) {
    throw new Error('API: No task results found')
  }

  if (response.tasks[0].status_code !== 20000) {
    throw new Error('DataForSEO-API: ' + response.tasks[0].status_message)
  }
}
