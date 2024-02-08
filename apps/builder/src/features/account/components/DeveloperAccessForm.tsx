import { Stack } from '@chakra-ui/react'
import React from 'react'
import { ApiTokensList } from './ApiTokensList'
import { useUser } from '../hooks/useUser'
export const DeveloperAccessForm = () => {
  const { user } = useUser()

  return (
    <Stack spacing="6" w="full" overflowY="auto">
      {user && <ApiTokensList user={user} />}
    </Stack>
  )
}
