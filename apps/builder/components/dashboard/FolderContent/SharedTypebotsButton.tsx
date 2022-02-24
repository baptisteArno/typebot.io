import React from 'react'
import { Button, Flex, Text, VStack, WrapItem } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { UsersIcon } from 'assets/icons'

export const SharedTypebotsButton = () => {
  const router = useRouter()

  const handleTypebotClick = () => router.push(`/typebots/shared`)

  return (
    <Button
      as={WrapItem}
      onClick={handleTypebotClick}
      display="flex"
      flexDir="column"
      variant="outline"
      color="gray.800"
      w="225px"
      h="270px"
      mr={{ sm: 6 }}
      mb={6}
      rounded="lg"
      whiteSpace="normal"
      cursor="pointer"
    >
      <VStack spacing="4">
        <Flex
          boxSize="45px"
          rounded="full"
          justifyContent="center"
          alignItems="center"
        >
          <UsersIcon fontSize="50" color="orange.300" />
        </Flex>
        <Text>Shared with me</Text>
      </VStack>
    </Button>
  )
}
