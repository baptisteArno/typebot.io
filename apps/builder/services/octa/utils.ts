import Storage from '@octadesk-tech/storage'
import { getAgents } from '../octa/agents';

export async function getServerSideProps() {
    const userToken = Storage.getItem('userToken')
    console.log('token1: ' + userToken)
    console.log('getServerSideProps edit.tsx')

    fetchAgents();
  
    return { props: { userToken, test: 'cordeiro' } }
  }
  

export const fetchAgents = async () => {
	const agents = await getAgents();

  console.log(agents);

	return agents
}
