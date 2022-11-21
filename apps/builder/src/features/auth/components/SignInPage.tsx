import { Seo } from '@/components/Seo'
import { TextLink } from '@/components/TextLink'
import { VStack, Heading, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { SignInForm } from './SignInForm'

type Props = {
  type: 'signin' | 'signup'
  defaultEmail?: string
}

export const SignInPage = ({ type }: Props) => {
  const { query } = useRouter()

  return (
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Seo title={type === 'signin' ? 'Sign In' : 'Register'} />
      <Heading
        onClick={() => {
          throw new Error('Sentry is working')
        }}
      >
        {type === 'signin' ? 'Sign In' : 'Create an account'}
      </Heading>
      {type === 'signin' ? (
        <Text>
          Don&apos;t have an account?{' '}
          <TextLink href="/register">Sign up for free</TextLink>
        </Text>
      ) : (
        <Text>
          Already have an account? <TextLink href="/signin">Sign in</TextLink>
        </Text>
      )}
      <SignInForm defaultEmail={query.g?.toString()} />
    </VStack>
  )
}
