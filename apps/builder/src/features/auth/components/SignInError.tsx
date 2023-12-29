import { useTranslate } from '@tolgee/react'
import { Alert } from '@chakra-ui/react'

type Props = {
  error: string
}

export const SignInError = ({ error }: Props) => {
  const { t } = useTranslate()
  const errors: Record<string, string> = {
    Signin: t('auth.error.default'),
    OAuthSignin: t('auth.error.default'),
    OAuthCallback: t('auth.error.default'),
    OAuthCreateAccount: t('auth.error.email'),
    EmailCreateAccount: t('auth.error.default'),
    Callback: t('auth.error.default'),
    OAuthAccountNotLinked: t('auth.error.oauthNotLinked'),
    default: t('auth.error.unknown'),
  }
  if (!errors[error]) return null
  return (
    <Alert status="error" variant="solid" rounded="md">
      {errors[error]}
    </Alert>
  )
}
