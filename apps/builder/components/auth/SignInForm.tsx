import {
  Button,
  HTMLChakraProps,
  Input,
  Stack,
  HStack,
  useToast,
} from '@chakra-ui/react'
import React, { ChangeEvent, FormEvent, useEffect } from 'react'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { DividerWithText } from './DividerWithText'
import { SocialLoginButtons } from './SocialLoginButtons'
import { useRouter } from 'next/router'

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
    if (status === 'authenticated') router.replace('/typebots')
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
  return (
    <Stack spacing="4">
      <SocialLoginButtons />
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
    </Stack>
  )
}
