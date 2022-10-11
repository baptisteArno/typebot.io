import { services } from '@octadesk-tech/services';

import { loadParameterHeader } from './headers';

let _client: any;
export const getClient = async () => {
  if (_client) {
    return _client
  }
  return (_client = await services.chatAgents.getClient())
}

export const getAgents = () =>
  getClient()
    .then((client) => client.get('', loadParameterHeader()))
    .then((res) => res.data)
