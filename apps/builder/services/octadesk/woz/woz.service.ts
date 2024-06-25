import { headers, services } from '@octadesk-tech/services'
import { IWOZServices } from './woz.types';

let _aiClient: any
const _api = 'ai'

export const getAIClient = async (options = {}) => {
  if (!_aiClient)
    _aiClient = await services.createClient(_api, options)

  return _aiClient
}

export const WOZService = (): IWOZServices => {

  const getAll = async () => {
    const { data } = await getAIClient().then(client =>
      client.get(`agents`, headers.getAuthorizedHeaders())
    )

    return data
  }

  return {
    getAll
  }
} 
