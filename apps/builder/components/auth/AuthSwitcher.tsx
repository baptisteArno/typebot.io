import React from 'react'
import { NextChakraLink } from '../nextChakra/NextChakraLink'
import { Text } from '@chakra-ui/react'

type Props = {
  type: 'register' | 'signin'
}
export const AuthSwitcher = ({ type }: Props) => (
  <>
    {type === 'signin' ? (
      <Text>
        Don't have an account?{' '}
        <NextChakraLink href="/register" color="blue.500" textDecor="underline">
          Sign up for free
        </NextChakraLink>
      </Text>
    ) : (
      <Text>
        Already have an account?{' '}
        <NextChakraLink href="/signin" color="blue.500" textDecor="underline">
          Sign in
        </NextChakraLink>
      </Text>
    )}
  </>
)
