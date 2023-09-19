import { router } from '@/helpers/server/trpc'
import { getPhoneNumber } from './getPhoneNumber'
import { getSystemTokenInfo } from './getSystemTokenInfo'
import { verifyIfPhoneNumberAvailable } from './verifyIfPhoneNumberAvailable'
import { generateVerificationToken } from './generateVerificationToken'
import { startWhatsAppPreview } from './startWhatsAppPreview'
import { subscribePreviewWebhook } from './subscribePreviewWebhook'
import { receiveMessagePreview } from './receiveMessagePreview'

export const whatsAppRouter = router({
  getPhoneNumber,
  getSystemTokenInfo,
  verifyIfPhoneNumberAvailable,
  generateVerificationToken,
  startWhatsAppPreview,
  subscribePreviewWebhook,
  receiveMessagePreview,
})
