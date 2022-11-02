import React from 'react'
import { Text } from '@chakra-ui/react'
import { TextLink } from 'components/shared/TextLink'

type Props = {
  type: 'register' | 'signin'
}
export const AuthSwitcher = ({ type }: Props) => (
  <>
    {type === 'signin' ? (
      <Text>
        Don't have an account?{' '}
        <TextLink href="/register">Sign up for free</TextLink>
      </Text>
    ) : (
      <Text>
        Already have an account? <TextLink href="/signin">Sign in</TextLink>
      </Text>
    )}
  </>
)
