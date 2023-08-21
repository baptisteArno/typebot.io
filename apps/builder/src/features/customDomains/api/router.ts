import { router } from '@/helpers/server/trpc'
import { createCustomDomain } from './createCustomDomain'
import { deleteCustomDomain } from './deleteCustomDomain'
import { listCustomDomains } from './listCustomDomains'

export const customDomainsRouter = router({
  createCustomDomain,
  deleteCustomDomain,
  listCustomDomains,
})
