import { ChevronLeftIcon } from '@/components/icons'
import { useUser } from '@/features/account/hooks/useUser'
import {
  Button,
  Flex,
  Heading,
  Link,
  VStack,
  Text,
  Spinner,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const TypebotNotFoundPage = () => {
  const { replace, asPath } = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (user || isLoading) return
    replace({
      pathname: '/signin',
      query: {
        redirectPath: asPath,
      },
    })
  }, [asPath, isLoading, replace, user])

  return (
    <Flex justify="center" align="center" w="full" h="100vh">
      {user ? (
        <VStack spacing={6}>
          <VStack>
            <Heading>404</Heading>
            <Text fontSize="xl">Typebot not found.</Text>
          </VStack>
          <Button
            as={Link}
            href="/typebots"
            colorScheme="orange"
            leftIcon={<ChevronLeftIcon />}
          >
            Dashboard
          </Button>
        </VStack>
      ) : (
        <Spinner />
      )}
    </Flex>
  )
}
