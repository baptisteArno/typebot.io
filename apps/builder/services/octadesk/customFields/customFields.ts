import { services } from '@octadesk-tech/services'
import { AxiosInstance } from 'axios'

import { getBaseClient } from '../http'
import { DomainType } from '../../../enums/customFieldsEnum'
import { loadParameterHeader } from '../helpers/headers'
import { CustomFieldsServicesInterface } from './types.customFields'

const getCustomFieldsClient = () => getBaseClient('customFields')

const CustomFields = (): CustomFieldsServicesInterface => {
  const getCustomFields = async (): Promise<any> => {
    const client = await getCustomFieldsClient()

    const { Person, Chat, Organization } = DomainType

    const values = await Promise.all([
      client.get(
        `/system-type/${Person}?showEnabledItems=true`,
        loadParameterHeader()
      ),
      client.get(
        `/system-type/${Chat}?showEnabledItems=true`,
        loadParameterHeader()
      ),
      client.get(
        `/system-type/${Organization}?showEnabledItems=true`,
        loadParameterHeader()
      ),
    ])
    return values.reduce((fields, current) => fields.concat(current.data), [])
  }

  const createCustomField = async (field: any): Promise<any> => {
    try {
      const client = await getCustomFieldsClient()
      const response = await client.post('/', field, loadParameterHeader())
      return response
    } catch (error) {
      console.error('Error on create custom field', error)
      throw error 
    }
  }

  return {
    getCustomFields,
    createCustomField,
  }
}

export default CustomFields
