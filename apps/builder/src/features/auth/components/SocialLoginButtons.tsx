import { Stack, Button } from '@chakra-ui/react'
import { GithubIcon } from '@/components/icons'
import {
  ClientSafeProvider,
  LiteralUnion,
  signIn,
  useSession,
} from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'
import { stringify } from 'qs'
import { BuiltInProviderType } from 'next-auth/providers'
import { GoogleLogo } from '@/components/GoogleLogo'
import { AzureAdLogo, FacebookLogo, GitlabLogo } from './logos'

type Props = {
  providers:
    | Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
    | undefined
}

export const SocialLoginButtons = ({ providers }: Props) => {
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

  const handleGitlabClick = async () =>
    signIn('gitlab', {
      callbackUrl: `/typebots?${stringify(query)}`,
    })

  const handleAzureAdClick = async () =>
    signIn('azure-ad', {
      callbackUrl: `/typebots?${stringify(query)}`,
    })

  return (
    <Stack>
      {providers?.github && (
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
      {providers?.google && (
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
      {providers?.facebook && (
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
      {providers?.gitlab && (
        <Button
          leftIcon={<GitlabLogo />}
          onClick={handleGitlabClick}
          data-testid="gitlab"
          isLoading={['loading', 'authenticated'].includes(status)}
          variant="outline"
        >
          Continue with {providers.gitlab.name}
        </Button>
      )}
      {providers?.['azure-ad'] && (
        <Button
          leftIcon={<AzureAdLogo />}
          onClick={handleAzureAdClick}
          data-testid="azure-ad"
          isLoading={['loading', 'authenticated'].includes(status)}
          variant="outline"
        >
          Continue with {providers['azure-ad'].name}
        </Button>
      )}
      {providers?.['custom-oauth'] && (
        <Button
          onClick={handleAzureAdClick}
          isLoading={['loading', 'authenticated'].includes(status)}
          variant="outline"
        >
          Continue with {providers['custom-oauth'].name}
        </Button>
      )}
    </Stack>
  )
}
