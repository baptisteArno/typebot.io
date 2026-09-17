import { router } from '@/helpers/server/trpc'
import { listWhatsappFlows } from './listWhatsappFlows'
import { getWhatsappFlowVariables } from './getWhatsappFlowVariables'

export const triggerWhatsappFlowRouter = router({
  listWhatsappFlows,
  getWhatsappFlowVariables,
})
