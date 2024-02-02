import { headers, services } from '@octadesk-tech/services'

const sendOctaRequest = async (request: {
  url: string
  method: string
  body?: any | undefined
}): Promise<any> => {
  const client = await services.chatBots.getClient()
  const authorationHeaders = headers.getAuthorizedHeaders()
  if (request.method === 'PUT' || request.method === 'PATCH')
    return client.put(request.url, request.body, authorationHeaders)

  if (request.method === 'POST')
    return client.post(request.url, request.body, authorationHeaders)

  if (request.method === 'DELETE')
    return client.delete(request.url, authorationHeaders)
}

export { sendOctaRequest }
