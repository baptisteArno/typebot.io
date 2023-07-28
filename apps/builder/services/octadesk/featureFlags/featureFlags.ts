import { services } from '@octadesk-tech/services'
import Storage from '@octadesk-tech/storage'
import { loadParameterHeader } from '../helpers/headers'
import { getBaseClient } from '../http'

const getClient = () => getBaseClient('company')

export const getCompany = () =>
  getClient()
    .then((client) => client.get('/model', loadParameterHeader()))
    .then((r) => r.data)

export const getStatus = async () => {
  const authStorage = Storage.getItem('auth') as any
  const tenantId = authStorage?.octaAuthenticated?.tenantId
  const nucleusUrl = process.env.NUCLEUS_API_URL || (window as any).NUCLEUS_API_URL
  
  if (tenantId) {
    try {
      const { data } = await services.nucleus.getClient({ baseURL: nucleusUrl }).get(`Tenants/${tenantId}/status`, {
        headers: {
          authorization: `Bearer ${authStorage.access_token}`
        }
      })

      return data
    } catch (ex) {
      throw new Error('Error in get status: ' + ex)
    }
  }
}
