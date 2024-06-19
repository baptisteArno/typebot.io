import { services } from '@octadesk-tech/services'
import Storage from '@octadesk-tech/storage'
import { ICustomVariable } from './interface'

export const fetchVariables = async (): Promise<ICustomVariable[]> => {
  const authStorage = Storage.getItem('userToken') as any
  const client = await services.createClient('persons')

  const resp = await client.get('contact-status', {
    headers: {
      authorization: `Bearer ${authStorage}`,
    },
  })
  return resp.data
}
