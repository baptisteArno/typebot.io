import React from 'react'
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { EyeDropIcon } from 'assets/icons/EyeDropIcon'
import Image from 'next/image'
import nativeFeelingSrc from 'public/images/homepage/native-feeling.png'

export const NativeFeeling = () => {
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
            <EyeDropIcon boxSize="30px" />
          </Flex>
          <Stack>
            <Heading as="h1">Native feeling for a higher conversion</Heading>
            <Text color="gray.500" size="lg">
              As if you spent time crafting this form by hand
            </Text>
          </Stack>
          <Text>
            A form that doesn't feel native to your landing page will impact
            dramatically its conversion potential
            <br />
            Typebot allows you to integrate the form in your landing page as if
            it were specifically designed for it. You can customize pretty much
            anything.
          </Text>
        </Stack>
        <Box rounded="md" shadow="lg" maxW="700px">
          <Image
            src={nativeFeelingSrc}
            alt="native feeling illustration"
            placeholder="blur"
          />
        </Box>
      </Stack>
    </Flex>
  )
}
