import { router } from '@/utils/server/trpc'
import { getBillingPortalUrl } from './procedures/getBillingPortalUrl'
import { listInvoices } from './procedures/listInvoices'
import { cancelSubscription } from './procedures/cancelSubscription'
import { createCheckoutSession } from './procedures/createCheckoutSession'
import { updateSubscription } from './procedures/updateSubscription'
import { getSubscription } from './procedures/getSubscription'
import { getUsage } from './procedures/getUsage'

export const billingRouter = router({
  getBillingPortalUrl,
  listInvoices,
  cancelSubscription,
  createCheckoutSession,
  updateSubscription,
  getSubscription,
  getUsage,
})
