import { Stack, Button } from '@chakra-ui/react'
import { GithubIcon } from '@/components/icons'
import {
  ClientSafeProvider,
  LiteralUnion,
  signIn,
  useSession,
} from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { stringify } from 'qs'
import { BuiltInProviderType } from 'next-auth/providers'
import { GoogleLogo } from '@/components/GoogleLogo'
import { omit } from '@typebot.io/lib'
import { AzureAdLogo } from '@/components/logos/AzureAdLogo'
import { FacebookLogo } from '@/components/logos/FacebookLogo'
import { GitlabLogo } from '@/components/logos/GitlabLogo'
import { useScopedI18n } from '@/locales'

type Props = {
  providers:
    | Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
    | undefined
}

export const SocialLoginButtons = ({ providers }: Props) => {
  const scopedT = useScopedI18n('auth.socialLogin')
  const { query } = useRouter()
  const { status } = useSession()
  const [authLoading, setAuthLoading] =
    useState<LiteralUnion<BuiltInProviderType, string>>()

  const handleSignIn = async (provider: string) => {
    setAuthLoading(provider)
    await signIn(provider, {
      callbackUrl:
        query.callbackUrl?.toString() ??
        `/typebots?${stringify(omit(query, 'error', 'callbackUrl'))}`,
    })
    setTimeout(() => setAuthLoading(undefined), 3000)
  }

  const handleGitHubClick = () => handleSignIn('github')

  const handleGoogleClick = () => handleSignIn('google')

  const handleFacebookClick = () => handleSignIn('facebook')

  const handleGitlabClick = () => handleSignIn('gitlab')

  const handleAzureAdClick = () => handleSignIn('azure-ad')

  const handleCustomOAuthClick = () => handleSignIn('custom-oauth')

  return (
    <Stack>
      {providers?.github && (
        <Button
          leftIcon={<GithubIcon />}
          onClick={handleGitHubClick}
          data-testid="github"
          isLoading={
            ['loading', 'authenticated'].includes(status) ||
            authLoading === 'github'
          }
          variant="outline"
        >
          {scopedT('githubButton.label')}
        </Button>
      )}
      {providers?.google && (
        <Button
          leftIcon={<GoogleLogo />}
          onClick={handleGoogleClick}
          data-testid="google"
          isLoading={
            ['loading', 'authenticated'].includes(status) ||
            authLoading === 'google'
          }
          variant="outline"
        >
          {scopedT('googleButton.label')}
        </Button>
      )}
      {providers?.facebook && (
        <Button
          leftIcon={<FacebookLogo />}
          onClick={handleFacebookClick}
          data-testid="facebook"
          isLoading={
            ['loading', 'authenticated'].includes(status) ||
            authLoading === 'facebook'
          }
          variant="outline"
        >
          {scopedT('facebookButton.label')}
        </Button>
      )}
      {providers?.gitlab && (
        <Button
          leftIcon={<GitlabLogo />}
          onClick={handleGitlabClick}
          data-testid="gitlab"
          isLoading={
            ['loading', 'authenticated'].includes(status) ||
            authLoading === 'gitlab'
          }
          variant="outline"
        >
          {scopedT('gitlabButton.label', {
            gitlabProviderName: providers.gitlab.name,
          })}
        </Button>
      )}
      {providers?.['azure-ad'] && (
        <Button
          leftIcon={<AzureAdLogo />}
          onClick={handleAzureAdClick}
          data-testid="azure-ad"
          isLoading={
            ['loading', 'authenticated'].includes(status) ||
            authLoading === 'azure-ad'
          }
          variant="outline"
        >
          {scopedT('azureButton.label', {
            azureProviderName: providers['azure-ad'].name,
          })}
        </Button>
      )}
      {providers?.['custom-oauth'] && (
        <Button
          onClick={handleCustomOAuthClick}
          isLoading={
            ['loading', 'authenticated'].includes(status) ||
            authLoading === 'custom-oauth'
          }
          variant="outline"
        >
          {scopedT('customButton.label', {
            customProviderName: providers['custom-oauth'].name,
          })}
        </Button>
      )}
    </Stack>
  )
}
