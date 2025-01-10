import Storage from '@octadesk-tech/storage';
import Axios from 'axios';
export const getNucleusAuthClient = () =>
  Axios.create({
    baseURL: 'https://us-east1-001.qa.qaoctadesk.com/'
  })

const getNucleusUrl = async () => {
  const authStorage = Storage.getItem('auth') as any
  const http = getNucleusAuthClient();

  const { data } = await http.get('/nucleus-auth/apiKeysManagement/apikeys-baseurl', {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${authStorage?.access_token}`,
    },
  })

  return data;
}

export const mountUrl = async ({ blockId, botId }: IMountUrl) => {
  const baseUrl = await getNucleusUrl();
  return `${baseUrl}/${botId}/${blockId}/id-conversa`
}

type IMountUrl = {
  blockId: string;
  botId: string;
}
