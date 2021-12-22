import { FacebookLogo, GithubLogo, GoogleLogo } from 'assets/logos'
import { Stack, Button } from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'
import React from 'react'

export const SocialLoginButtons = () => {
  const { status } = useSession()

  const handleGitHubClick = async () => signIn('github')

  const handleGoogleClick = async () => signIn('google')

  const handleFacebookClick = async () => signIn('facebook')

  return (
    <Stack>
      <Button
        leftIcon={<GithubLogo />}
        onClick={handleGitHubClick}
        data-testid="github"
        isLoading={['loading', 'authenticated'].includes(status)}
      >
        Continue with GitHub
      </Button>
      <Button
        leftIcon={<GoogleLogo />}
        onClick={handleGoogleClick}
        data-testid="google"
        isLoading={['loading', 'authenticated'].includes(status)}
      >
        Continue with Google
      </Button>
      <Button
        leftIcon={<FacebookLogo />}
        onClick={handleFacebookClick}
        data-testid="facebook"
        isLoading={['loading', 'authenticated'].includes(status)}
      >
        Continue with Facebook
      </Button>
    </Stack>
  )
}
