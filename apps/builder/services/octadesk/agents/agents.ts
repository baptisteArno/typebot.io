import { services } from '@octadesk-tech/services'
import { AxiosInstance } from 'axios'

import { loadParameterHeader } from '../helpers/headers'
import { AgentsServicesInterface } from './types.agents';

const Agents = (): AgentsServicesInterface => {
  let _client: AxiosInstance;
  const getClient = async (): Promise<AxiosInstance> => {
    if (_client) {
      return _client
    }
    return (_client = await services.chatAgents.getClient())
  }
  
  const activeAgent = (idAgent: string): Promise<any> =>
    getClient()
      .then(client => client.put(`/${idAgent}/active`, {}, loadParameterHeader()))
      .then(res => res.data)
  
  const inactiveAgent = (idAgent: string): Promise<any> =>
    getClient()
      .then(client =>
        client.put(`/${idAgent}/inactive`, {}, loadParameterHeader())
      )
      .then(res => res.data)
  
  const activeAgents = (idAgents: string): Promise<any> =>
    getClient()
      .then(client => client.put(`/active`, idAgents, loadParameterHeader()))
      .then(res => res.data)
  
  const getAgents = (): Promise<any> =>
    getClient()
      .then(client => client.get('', loadParameterHeader()))
      .then(res => res.data)

  return {
    activeAgent,
    inactiveAgent,
    activeAgents,
    getAgents
  }
}

export default Agents
