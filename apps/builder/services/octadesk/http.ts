import { services, url } from '@octadesk-tech/services'

const API_CLIENTS = new Map()

export const getBaseClient = async (api: any, options = {}) => {
  if (API_CLIENTS.has(api)) {
    return API_CLIENTS.get(api)
  }

  const client = await services.createClient(api, options)
  API_CLIENTS.set(api, client)
  return client
}

export const getAPIURL = async (apiKey: string) => {
  return await url.getAPIURL(apiKey)
}
