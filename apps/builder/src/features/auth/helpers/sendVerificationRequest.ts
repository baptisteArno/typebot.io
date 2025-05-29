import { sendMagicLinkEmail } from '@typebot.io/emails'
import logger from '@/helpers/logger'

type Props = {
  identifier: string
  url: string
}

export const sendVerificationRequest = async ({ identifier, url }: Props) => {
  try {
    await sendMagicLinkEmail({ url, to: identifier })
  } catch (err) {
    logger.error(err)
    throw new Error(`Magic link email could not be sent. See error above.`)
  }
}
