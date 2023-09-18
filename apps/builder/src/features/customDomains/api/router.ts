import { router } from '@/helpers/server/trpc'
import { createCustomDomain } from './createCustomDomain'
import { deleteCustomDomain } from './deleteCustomDomain'
import { listCustomDomains } from './listCustomDomains'
import { verifyCustomDomain } from './verifyCustomDomain'

export const customDomainsRouter = router({
  createCustomDomain,
  deleteCustomDomain,
  listCustomDomains,
  verifyCustomDomain,
})
