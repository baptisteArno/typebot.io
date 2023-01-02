import {
  Button,
  HTMLChakraProps,
  Input,
  Stack,
  HStack,
  Text,
  Spinner,
} from '@chakra-ui/react'
import React, { ChangeEvent, FormEvent, useEffect } from 'react'
import { useState } from 'react'
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
  signIn,
  useSession,
} from 'next-auth/react'
import { DividerWithText } from './DividerWithText'
import { SocialLoginButtons } from './SocialLoginButtons'
import { useRouter } from 'next/router'
import { BuiltInProviderType } from 'next-auth/providers'
import { useToast } from '@/hooks/useToast'
import { TextLink } from '@/components/TextLink'

type Props = {
  defaultEmail?: string
}
export const SignInForm = ({
  defaultEmail,
}: Props & HTMLChakraProps<'form'>) => {
  const router = useRouter()
  const { status } = useSession()
  const [authLoading, setAuthLoading] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)

  const [emailValue, setEmailValue] = useState(defaultEmail ?? '')
  const { showToast } = useToast()
  const [providers, setProviders] =
    useState<
      Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
    >()

  const hasNoAuthProvider =
    !isLoadingProviders && Object.keys(providers ?? {}).length === 0

  useEffect(() => {
    if (status === 'authenticated')
      router.replace({ pathname: '/typebots', query: router.query })
    ;(async () => {
      const providers = await getProviders()
      setProviders(providers ?? undefined)
      setIsLoadingProviders(false)
    })()
  }, [status, router])

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmailValue(e.target.value)

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    const response = await signIn('email', {
      email: emailValue,
      redirect: false,
    })
    response?.error
      ? showToast({
          title: 'Unauthorized',
          description: 'Sign ups are disabled.',
        })
      : showToast({
          status: 'success',
          title: 'Success!',
          description: 'Check your inbox to sign in',
        })
    setAuthLoading(false)
  }

  if (isLoadingProviders) return <Spinner />
  if (hasNoAuthProvider)
    return (
      <Text>
        You need to{' '}
        <TextLink
          href="https://docs.typebot.io/self-hosting/configuration"
          isExternal
        >
          configure at least one auth provider
        </TextLink>{' '}
        (Email, Google, GitHub, Facebook or Azure AD).
      </Text>
    )
  return (
    <Stack spacing="4" w="330px">
      <SocialLoginButtons providers={providers} />
      {providers?.email && (
        <>
          <DividerWithText mt="6">Or with your email</DividerWithText>
          <HStack as="form" onSubmit={handleEmailSubmit}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@company.com"
              required
              value={emailValue}
              onChange={handleEmailChange}
            />
            <Button
              type="submit"
              isLoading={
                ['loading', 'authenticated'].includes(status) || authLoading
              }
            >
              Submit
            </Button>
          </HStack>
        </>
      )}
    </Stack>
  )
}
