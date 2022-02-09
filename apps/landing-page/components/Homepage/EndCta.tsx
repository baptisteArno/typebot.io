import { Box, Heading, Button, Text } from '@chakra-ui/react'
import React from 'react'
import { BackgroundPolygons } from './Hero/BackgroundPolygons'

export const EndCta = () => {
  return (
    <Box as="section" py={32} pos="relative">
      <BackgroundPolygons />
      <Box
        maxW="2xl"
        mx="auto"
        px={{ base: '6', lg: '8' }}
        py={{ base: '16', sm: '20' }}
        textAlign="center"
      >
        <Heading fontWeight="extrabold" letterSpacing="tight">
          Take your forms to the next level
        </Heading>
        <Text mt="4" fontSize="lg">
          Try Typebot for free and start improving the performance of your form
        </Text>
        <Button
          as="a"
          href="https://app.typebot.io/signup"
          mt="8"
          size="lg"
          colorScheme="blue"
          fontWeight="bold"
        >
          Create a typebot
        </Button>
      </Box>
    </Box>
  )
}
