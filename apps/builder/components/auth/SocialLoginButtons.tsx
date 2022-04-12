import { Stack, Button } from '@chakra-ui/react'
import { GithubIcon } from 'assets/icons'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'
import { stringify } from 'qs'
import { FacebookLogo, GoogleLogo } from 'assets/logos'

export const SocialLoginButtons = () => {
  const { query } = useRouter()
  const { status } = useSession()

  const handleGitHubClick = async () =>
    signIn('github', {
      callbackUrl: `/typebots?${stringify(query)}`,
    })

  const handleGoogleClick = async () =>
    signIn('google', {
      callbackUrl: `/typebots?${stringify(query)}`,
    })

  const handleFacebookClick = async () =>
    signIn('facebook', {
      callbackUrl: `/typebots?${stringify(query)}`,
    })

  return (
    <Stack>
      {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
        <Button
          leftIcon={<GithubIcon />}
          onClick={handleGitHubClick}
          data-testid="github"
          isLoading={['loading', 'authenticated'].includes(status)}
          variant="outline"
        >
          Continue with GitHub
        </Button>
      )}
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <Button
          leftIcon={<GoogleLogo />}
          onClick={handleGoogleClick}
          data-testid="google"
          isLoading={['loading', 'authenticated'].includes(status)}
          variant="outline"
        >
          Continue with Google
        </Button>
      )}
      {process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID && (
        <Button
          leftIcon={<FacebookLogo />}
          onClick={handleFacebookClick}
          data-testid="facebook"
          isLoading={['loading', 'authenticated'].includes(status)}
          variant="outline"
        >
          Continue with Facebook
        </Button>
      )}
    </Stack>
  )
}
