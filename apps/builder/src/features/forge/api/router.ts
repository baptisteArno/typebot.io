import { router } from '@/helpers/server/trpc'
import { fetchSelectItems } from './fetchSelectItems'
import { createCredentials } from './credentials/createCredentials'
import { deleteCredentials } from './credentials/deleteCredentials'
import { listCredentials } from './credentials/listCredentials'

export const forgeRouter = router({
  fetchSelectItems,
  createCredentials,
  listCredentials,
  deleteCredentials,
})
