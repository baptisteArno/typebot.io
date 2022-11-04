import { sendRequest } from 'utils'

export const isPublicDomainAvailableQuery = (publicId: string) =>
  sendRequest<{ isAvailable: boolean }>({
    method: 'GET',
    url: `/api/publicIdAvailable?publicId=${publicId}`,
  })
