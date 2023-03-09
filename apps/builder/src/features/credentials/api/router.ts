import { router } from '@/utils/server/trpc'
import { createCredentials } from './createCredentials'
import { deleteCredentials } from './deleteCredentials'
import { listCredentials } from './listCredentials'

export const credentialsRouter = router({
  createCredentials,
  listCredentials,
  deleteCredentials,
})
