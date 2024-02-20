import { headers, services } from '@octadesk-tech/services'
import { ITagsServices, Tag } from './tags.types';

let _clientChat: any
const getChatClient = async () => {
  if (_clientChat) {
    return _clientChat
  }
  return (_clientChat = await services.chat.getClient())
}

export const TagsService = (): ITagsServices => {
  
  const getAll = async () => {
    const { data } = await getChatClient().then(client =>
      client.get(`public-tags`, headers.getAuthorizedHeaders())
    )
  
    return data
  }

  return {
    getAll
  }
} 
