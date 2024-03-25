import { got } from 'got'
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
  const r = await got.post(apiUrl('process_serp'), {
    headers: getHeaders(apiKey),
    json: request,
  })
  if (r.statusCode !== 200) {
    throw new Error('Frase.io-API: response ' + r.statusCode)
  }
  return JSON.parse(r.body) as SerpResponse
}
