import { sendMagicLinkEmail } from '@typebot.io/emails'

type Props = {
  identifier: string
  token: string
}

export const sendVerificationRequest = async ({ identifier, token }: Props) => {
  try {
    const url = `${
      process.env.NEXTAUTH_URL
    }/api/auth/callback/email?${new URLSearchParams({
      email: identifier,
      token,
    }).toString()}`
    await sendMagicLinkEmail({ url, to: identifier })
  } catch (err) {
    throw new Error(`Email(s) could not be sent`)
  }
}
