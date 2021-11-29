import withAuth, { withAuthProps } from 'components/HOC/withUser'
import { Text } from '@chakra-ui/react'
import React from 'react'

const TypebotsPage = ({ user }: withAuthProps) => {
  return <Text data-testid="authenticated">Hello {user?.email}</Text>
}

export default withAuth(TypebotsPage)
