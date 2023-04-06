import { useScopedI18n } from '@/locales'
import { Alert } from '@chakra-ui/react'

type Props = {
  error: string
}

export const SignInError = ({ error }: Props) => {
  const scopedT = useScopedI18n('auth.error')
  const errors: Record<string, string> = {
    Signin: scopedT('default'),
    OAuthSignin: scopedT('default'),
    OAuthCallback: scopedT('default'),
    OAuthCreateAccount: scopedT('email'),
    EmailCreateAccount: scopedT('default'),
    Callback: scopedT('default'),
    OAuthAccountNotLinked: scopedT('oauthNotLinked'),
    default: scopedT('unknown'),
  }
  return (
    <Alert status="error" variant="solid" rounded="md">
      {errors[error] ?? errors[error]}
    </Alert>
  )
}
