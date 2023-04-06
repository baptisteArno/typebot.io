import {
  Button,
  HTMLChakraProps,
  Input,
  Stack,
  HStack,
  Text,
  Spinner,
  Alert,
  Flex,
  AlertIcon,
  SlideFade,
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
import { SignInError } from './SignInError'
import { useScopedI18n } from '@/locales'

type Props = {
  defaultEmail?: string
}
export const SignInForm = ({
  defaultEmail,
}: Props & HTMLChakraProps<'form'>) => {
  const scopedT = useScopedI18n('auth')
  const router = useRouter()
  const { status } = useSession()
  const [authLoading, setAuthLoading] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)

  const [emailValue, setEmailValue] = useState(defaultEmail ?? '')
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)

  const { showToast } = useToast()
  const [providers, setProviders] =
    useState<
      Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
    >()

  const hasNoAuthProvider =
    !isLoadingProviders && Object.keys(providers ?? {}).length === 0

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(router.query.callbackUrl?.toString() ?? '/typebots')
      return
    }
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
    if (isMagicLinkSent) return
    setAuthLoading(true)
    const response = await signIn('email', {
      email: emailValue,
      redirect: false,
    })
    if (response?.error) {
      showToast({
        title: scopedT('signinErrorToast.title'),
        description: scopedT('signinErrorToast.description'),
      })
    } else {
      setIsMagicLinkSent(true)
    }
    setAuthLoading(false)
  }

  if (isLoadingProviders) return <Spinner />
  if (hasNoAuthProvider)
    return (
      <Text>
        {scopedT('noProvider.preLink')}{' '}
        <TextLink
          href="https://docs.typebot.io/self-hosting/configuration"
          isExternal
        >
          {scopedT('noProvider.link')}
        </TextLink>
      </Text>
    )
  return (
    <Stack spacing="4" w="330px">
      {!isMagicLinkSent && (
        <>
          <SocialLoginButtons providers={providers} />
          {providers?.email && (
            <>
              <DividerWithText mt="6">
                {scopedT('orEmailLabel')}
              </DividerWithText>
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
                  isDisabled={isMagicLinkSent}
                >
                  {scopedT('emailSubmitButton.label')}
                </Button>
              </HStack>
            </>
          )}
        </>
      )}
      {router.query.error && (
        <SignInError error={router.query.error.toString()} />
      )}
      <SlideFade offsetY="20px" in={isMagicLinkSent} unmountOnExit>
        <Flex>
          <Alert status="success" w="100%">
            <HStack>
              <AlertIcon />
              <Stack spacing={1}>
                <Text fontWeight="semibold">{scopedT('magicLink.title')}</Text>
                <Text fontSize="sm">{scopedT('magicLink.description')}</Text>
              </Stack>
            </HStack>
          </Alert>
        </Flex>
      </SlideFade>
    </Stack>
  )
}
