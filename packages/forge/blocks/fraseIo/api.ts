import { HTTPError, got } from 'got'
import { SerpResponse } from './types'

const getHeaders = (apiKey?: string) => {
  return {
    'Content-Type': 'application/json',
    token: `${apiKey}`,
  }
}

export const apiUrl = (uri: string, sandbox = false) =>
  `https://${sandbox ? 'sandbox' : 'api'}.frase.io/api/v1/${uri}`

export async function apiProcessSerp(apiKey: string | undefined, request: any) {
  try {
    const r = await got.post(apiUrl('process_serp'), {
      headers: getHeaders(apiKey),
      json: request,
    })
    return JSON.parse(r.body) as SerpResponse
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
