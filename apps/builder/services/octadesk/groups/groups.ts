import { services } from '@octadesk-tech/services'
import { AxiosInstance } from 'axios'

import { loadParameterHeader } from '../helpers/headers'
import { GroupsServicesInterface } from './types.groups';

const Groups = (): GroupsServicesInterface => {
  let _client: AxiosInstance
  const getClient = async () => {
    if (_client) {
      return _client
    }
    return (_client = await services.chat.getClient())
  }

  const getGroups = (): Promise<any> =>
    getClient()
      .then(client => client.get('groups', loadParameterHeader()))
      .then(res => res.data)

  const enableGroup = (group: any) =>
    getClient().then(client =>
      client.put(`groups/${group.id}/enable`, undefined, loadParameterHeader())
    )

  const disableGroup = (group: any) =>
    getClient().then(client =>
      client.put(`groups/${group.id}/disable`, undefined, loadParameterHeader())
    )

  const updateGroup = (group: any) =>
    getClient().then(client =>
      client.put(`groups/${group.id}`, group, loadParameterHeader())
    )

  const createGroup = (group: any) =>
    getClient().then(client =>
      client.post('groups', group, loadParameterHeader())
    )

  const removeGroup = (group: any) =>
    getClient().then(client =>
      client.delete(`groups/${group.id}`, loadParameterHeader())
    )

  const removeGroups = (groups: any) =>
    getClient().then(client =>
      client.post(`groups/bulk/delete`, groups, loadParameterHeader())
    )
  return {
    getGroups,
    enableGroup,
    disableGroup,
    updateGroup,
    createGroup,
    removeGroup,
    removeGroups
  }
}

export default Groups