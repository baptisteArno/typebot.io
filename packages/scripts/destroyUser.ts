import { destroyUser } from './helpers/destroyUser'
import { promptAndSetEnvironment } from './utils'

const runDestroyUser = async () => {
  await promptAndSetEnvironment('production')
  return destroyUser()
}

runDestroyUser()
