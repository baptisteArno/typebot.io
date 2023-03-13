import { EmailConfig } from 'next-auth/providers/email'
import { sendMagicLinkEmail } from 'emails'

type Props = {
  identifier: string
  url: string
  provider: Partial<Omit<EmailConfig, 'options'>>
}

export const sendVerificationRequest = async ({ identifier, url }: Props) => {
  try {
    await sendMagicLinkEmail({ url, to: identifier })
  } catch (err) {
    throw new Error(`Email(s) could not be sent`)
  }
}
