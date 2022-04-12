import {
  Button,
  HTMLChakraProps,
  Input,
  Stack,
  HStack,
  useToast,
  Text,
} from '@chakra-ui/react'
import React, { ChangeEvent, FormEvent, useEffect } from 'react'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { DividerWithText } from './DividerWithText'
import { SocialLoginButtons } from './SocialLoginButtons'
import { useRouter } from 'next/router'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'

const hasNoAuthProvider =
  (!process.env.NEXT_PUBLIC_SMTP_FROM ||
    process.env.NEXT_PUBLIC_SMTP_AUTH_DISABLED === 'true') &&
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID &&
  process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID

type Props = {
  defaultEmail?: string
}
export const SignInForm = ({
  defaultEmail,
}: Props & HTMLChakraProps<'form'>) => {
  const router = useRouter()
  const { status } = useSession()
  const [authLoading, setAuthLoading] = useState(false)
  const [emailValue, setEmailValue] = useState(defaultEmail ?? '')
  const toast = useToast({
    position: 'top-right',
  })

  useEffect(() => {
    if (status === 'authenticated')
      router.replace({ pathname: '/typebots', query: router.query })
  }, [status, router])

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmailValue(e.target.value)

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    await signIn('email', {
      email: emailValue,
      redirect: false,
    })
    toast({
      status: 'success',
      title: 'Success!',
      description: 'Check your inbox to sign in',
    })
    setAuthLoading(false)
  }
  if (hasNoAuthProvider)
    return (
      <Text>
        You need to{' '}
        <NextChakraLink
          href="https://docs.typebot.io/self-hosting/configuration"
          isExternal
          color="blue.400"
          textDecor="underline"
        >
          configure at least one auth provider
        </NextChakraLink>{' '}
        (Email, Google, GitHub or Facebook).
      </Text>
    )
  return (
    <Stack spacing="4" w="330px">
      <SocialLoginButtons />
      {process.env.NEXT_PUBLIC_SMTP_FROM &&
        process.env.NEXT_PUBLIC_SMTP_AUTH_DISABLED !== 'true' && (
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
