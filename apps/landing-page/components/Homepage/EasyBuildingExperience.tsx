import { Flex, Stack, Heading, Box, Text, Button } from '@chakra-ui/react'
import React from 'react'
import Image from 'next/image'
import builderDndSrc from 'public/images/homepage/builder-dnd.png'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { ArrowRight } from 'assets/icons/ArrowRight'
import { Flare } from 'assets/illustrations/Flare'

export const EasyBuildingExperience = () => {
  return (
    <Flex as="section" justify="center" pos="relative">
      <Flare color="blue" pos="absolute" left="-200px" top="-50px" />
      <Stack
        style={{ maxWidth: '1000px' }}
        pt={'52'}
        w="full"
        px="4"
        spacing={12}
        direction={['column', 'row-reverse']}
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack spacing="6" maxW="300px">
          <Stack>
            <Heading as="h1">Easy building experience</Heading>
          </Stack>
          <Text color="gray.400" fontSize={{ base: 'lg', xl: 'xl' }}>
            All you have to do is drag and drop blocks to create your app. Even
            if you have custom needs, you can always add custom code.
          </Text>
          <Flex>
            <Button
              as={NextChakraLink}
              rightIcon={<ArrowRight />}
              href={`https://app.typebot.io/register`}
              variant="ghost"
            >
              Try it now
            </Button>
          </Flex>
        </Stack>
        <Box rounded="md">
          <Image
            src={builderDndSrc}
            alt="incomplete results illustration"
            placeholder="blur"
          />
        </Box>
      </Stack>
    </Flex>
  )
}
