import { router } from '@/helpers/server/trpc'
import { getPhoneNumber } from './getPhoneNumber'
import { getSystemTokenInfo } from './getSystemTokenInfo'
import { verifyIfPhoneNumberAvailable } from './verifyIfPhoneNumberAvailable'
import { generateVerificationToken } from './generateVerificationToken'

export const whatsAppRouter = router({
  getPhoneNumber,
  getSystemTokenInfo,
  verifyIfPhoneNumberAvailable,
  generateVerificationToken,
})
