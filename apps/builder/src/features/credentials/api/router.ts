import { router } from '@/helpers/server/trpc'
import { createCredentials } from './createCredentials'
import { deleteCredentials } from './deleteCredentials'
import { listCredentials } from './listCredentials'
import { updateCredentials } from './updateCredentials'
import { getCredentials } from './getCredentials'

export const credentialsRouter = router({
  createCredentials,
  listCredentials,
  getCredentials,
  deleteCredentials,
  updateCredentials,
})
