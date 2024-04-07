import { initGoogleAnalytics } from '@/lib/gtag'
import { gtmBodyElement } from '@/lib/gtm'
import { initPixel } from '@/lib/pixel'
import {
  injectCustomHeadCode,
  isDefined,
  isNotEmpty,
} from '@typebot.io/lib/utils'
import { StartPropsToInject } from '@typebot.io/schemas'

export const injectStartProps = async (
  startPropsToInject: StartPropsToInject
) => {
  const customHeadCode = startPropsToInject.customHeadCode
  if (isNotEmpty(customHeadCode)) injectCustomHeadCode(customHeadCode)
  const gtmId = startPropsToInject.gtmId
  if (isNotEmpty(gtmId)) document.body.prepend(gtmBodyElement(gtmId))
  const googleAnalyticsId = startPropsToInject.googleAnalyticsId
  if (isNotEmpty(googleAnalyticsId))
    await initGoogleAnalytics(googleAnalyticsId)
  const pixelIds = startPropsToInject.pixelIds
  if (isDefined(pixelIds)) initPixel(pixelIds)
}
