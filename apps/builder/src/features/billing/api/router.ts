import { router } from '@/helpers/server/trpc'
import { cancelSubscription } from './cancelSubscription'
import { createCheckoutSession } from './createCheckoutSession'
import { getBillingPortalUrl } from './getBillingPortalUrl'
import { getSubscription } from './getSubscription'
import { getUsage } from './getUsage'
import { listInvoices } from './listInvoices'
import { updateSubscription } from './updateSubscription'

export const billingRouter = router({
  getBillingPortalUrl,
  listInvoices,
  cancelSubscription,
  createCheckoutSession,
  updateSubscription,
  getSubscription,
  getUsage,
})
