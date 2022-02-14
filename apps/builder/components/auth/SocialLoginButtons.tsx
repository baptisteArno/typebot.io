import { Stack, Button } from '@chakra-ui/react'
import { FacebookIcon, GithubIcon, GoogleIcon } from 'assets/icons'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'
import { stringify } from 'qs'

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
      <Button
        leftIcon={<GithubIcon />}
        onClick={handleGitHubClick}
        data-testid="github"
        isLoading={['loading', 'authenticated'].includes(status)}
      >
        Continue with GitHub
      </Button>
      <Button
        leftIcon={<GoogleIcon />}
        onClick={handleGoogleClick}
        data-testid="google"
        isLoading={['loading', 'authenticated'].includes(status)}
      >
        Continue with Google
      </Button>
      <Button
        leftIcon={<FacebookIcon />}
        onClick={handleFacebookClick}
        data-testid="facebook"
        isLoading={['loading', 'authenticated'].includes(status)}
      >
        Continue with Facebook
      </Button>
    </Stack>
  )
}
