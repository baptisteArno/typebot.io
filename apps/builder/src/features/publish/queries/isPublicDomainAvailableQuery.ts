import { sendRequest } from '@sniper.io/lib'

export const isPublicDomainAvailableQuery = (publicId: string) =>
  sendRequest<{ isAvailable: boolean }>({
    method: 'GET',
    url: `/api/publicIdAvailable?publicId=${publicId}`,
  })
