import { services, url } from '@octadesk-tech/services'
import { AxiosInstance } from 'axios'

const API_CLIENTS = new Map()

export const getBaseClient = async (api: any, options = {}) => {
  if (API_CLIENTS.has(api)) {
    return API_CLIENTS.get(api)
  }

  const client = await services.createClient(api, options)
  API_CLIENTS.set(api, client)
  return client
}

let _chatAPIURL: any

export const getChatAPIURL = async (): Promise<AxiosInstance> => {
  if (_chatAPIURL && _chatAPIURL.length) {
    return _chatAPIURL
  }

  _chatAPIURL = await url.getAPIURL('chatUrl')

  console.log(_chatAPIURL)

  return _chatAPIURL
}

export const getAPIURL = async (apiKey: string) => {
  return await url.getAPIURL(apiKey)
}
