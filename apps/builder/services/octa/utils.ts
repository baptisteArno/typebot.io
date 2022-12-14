import Storage from '@octadesk-tech/storage'
import { getAgents } from '../octa/agents';

export async function getServerSideProps() {
    const userToken = Storage.getItem('userToken')

    fetchAgents();
  
    return { props: { userToken, test: 'cordeiro' } }
  }
  

export const fetchAgents = async () => {
	const agents = await getAgents();

	return agents
}
