import React from 'react'
import { Box, chakra, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import incompleteResultsSrc from 'public/images/homepage/incomplete-results.png'
import Image from 'next/image'
import { AlbumsIcon } from 'assets/icons/AlbumsIcon'

export const DontLooseData = () => {
  return (
    <Flex justify="center">
      <Stack
        style={{ maxWidth: '1200px' }}
        pt={32}
        w="full"
        px="4"
        spacing={6}
        direction={['column', 'row']}
      >
        <Stack spacing="6">
          <Flex
            boxSize="50px"
            bgColor="blue.500"
            rounded="lg"
            color="white"
            justify="center"
            align="center"
            shadow="lg"
          >
            <AlbumsIcon boxSize="30px" />
          </Flex>
          <Stack>
            <Heading as="h1">Stop losing data from your forms</Heading>
            <Text color="gray.500" size="lg">
              Each answered question has a huge value
            </Text>
          </Stack>
          <Text>
            nstead of collecting it only when it is fully submitted, with a
            Typebot form,{' '}
            <chakra.span fontWeight="bold">
              you collect the result as soon as the user answers the first
              question.
            </chakra.span>
            <br />
            You have access to all the incomplete results in your dashboard so
            that it helps you figure out how you can properly improve your form
          </Text>
        </Stack>

        <Box rounded="md" shadow="lg" maxW="700px">
          <Image
            src={incompleteResultsSrc}
            alt="incomplete results illustration"
            placeholder="blur"
          />
        </Box>
      </Stack>
    </Flex>
  )
}
