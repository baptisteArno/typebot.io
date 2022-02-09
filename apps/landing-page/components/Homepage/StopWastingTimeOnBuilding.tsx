import React from 'react'
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import ConversionGraderSrc from 'public/images/homepage/conversion-grader.png'
import Image from 'next/image'
import { BuildIcon } from 'assets/icons/BuildIcon'

export const StopSpendingTimeOnBuilding = () => {
  return (
    <Flex justifyContent="center">
      <Stack
        style={{ maxWidth: '1200px' }}
        pt={32}
        w="full"
        px="4"
        spacing={6}
        direction={['column', 'row']}
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
            <BuildIcon boxSize="30px" />
          </Flex>
          <Stack>
            <Heading as="h1">
              Stop wasting your time on building the form
            </Heading>
            <Text color="gray.500" size="lg">
              Easy building experience and a grader to make your life easier
            </Text>
          </Stack>

          <Text>
            A form should be improved over time based on its performance. You
            shouldn't spend time working on the "perfect" first version.
            <br />
            Typebot comes with multiple verified templates to choose from.
            <br />
            And it offers a grader tool that gives a score your form in
            real-time based on best practices we collected from high-performing
            forms
          </Text>
        </Stack>
        <Box rounded="md" shadow="lg" maxW="400px">
          <Image
            src={ConversionGraderSrc}
            alt="conversion grader illustration"
            placeholder="blur"
          />
        </Box>
      </Stack>
    </Flex>
  )
}
