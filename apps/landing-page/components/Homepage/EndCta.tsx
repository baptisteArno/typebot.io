import { Heading, Button, Text, Flex, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { BackgroundPolygons } from './Hero/BackgroundPolygons'

export const EndCta = () => {
  return (
    <VStack
      as="section"
      py={32}
      pos="relative"
      bgGradient="linear(to-b, gray.900, gray.800)"
      height="100vh"
      justifyContent="center"
    >
      <BackgroundPolygons />
      <VStack
        spacing="6"
        maxW="2xl"
        mx="auto"
        px={{ base: '6', lg: '8' }}
        py={{ base: '16', sm: '20' }}
        textAlign="center"
      >
        <Heading
          fontWeight="extrabold"
          letterSpacing="tight"
          data-aos="fade-up"
        >
          Take your forms to the next level
        </Heading>
        <Flex>
          <Button
            as={Link}
            href="https://app.typebot.io/register"
            size="lg"
            colorScheme="orange"
            height="4rem"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Create a typebot
          </Button>
        </Flex>

        <Text color="gray.400" data-aos="fade-up" data-aos-delay="400">
          No trial. Generous, unlimited <strong>free</strong> plan.
        </Text>
      </VStack>
    </VStack>
  )
}
