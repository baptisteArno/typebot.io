import React from 'react'
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import inDepthAnalyticsSrc from 'public/images/homepage/analytics.png'
import Image from 'next/image'
import { AnalyticsIcon } from 'assets/icons/AnalyticsIcon'

export const IterateQuickly = () => {
  return (
    <Flex as="section" justify="center">
      <Stack
        style={{ maxWidth: '1200px' }}
        pt={32}
        w="full"
        px="4"
        spacing={6}
        flexDir={['column', 'row-reverse']}
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack spacing="6" maxW="500px">
          <Flex
            boxSize="50px"
            bgColor="blue.500"
            rounded="lg"
            color="white"
            justify="center"
            align="center"
            shadow="lg"
          >
            <AnalyticsIcon boxSize="30px" />
          </Flex>
          <Stack>
            <Heading as="h1">
              Iterate quickly and optimize the conversion
            </Heading>
            <Text color="gray.500" size="lg">
              Each question has a cost in your drop-off rate.
            </Text>
          </Stack>
          <Text>
            Typebot generates an in-depth analytics graph report with completion
            and drop-off rates. That helps you know at a glance a potential
            bottleneck in your form. <br />
            All you need to do is to fix it and hit the Publish button.
          </Text>
        </Stack>
        <Box rounded="md" shadow="lg" maxW="500px">
          <Image
            src={inDepthAnalyticsSrc}
            alt="incomplete results illustration"
            placeholder="blur"
          />
        </Box>
      </Stack>
    </Flex>
  )
}
