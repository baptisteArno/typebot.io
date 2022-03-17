import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import * as React from 'react'
import { Navbar } from '../../common/Navbar/Navbar'
import { BackgroundPolygons } from './BackgroundPolygons'
import * as Logos from './Brands'
import Image from 'next/image'
import builderScreenshotSrc from 'public/images/homepage/builder.png'
import { GitHubIcon } from 'assets/icons'

export const Hero = () => {
  return (
    <Box as="section" overflow="hidden">
      <Navbar />
      <Stack mx="auto" py="10" pos="relative" pb="32" px={[4, 0]}>
        <BackgroundPolygons />
        <VStack mb="20" spacing={20} alignItems="center">
          <VStack pt={['10', '20']} spacing="6" w="full">
            <Heading
              as="h1"
              fontSize={['4xl', '4xl', '5xl', '7xl']}
              textAlign="center"
              maxW="1000px"
              bgGradient="linear(to-r, blue.300, purple.300)"
              bgClip="text"
            >
              Open-source conversational apps builder
            </Heading>
            <Text fontSize={['lg', 'xl']} maxW="800px" textAlign="center">
              Typebot gives you powerful blocks to create unique chat
              experiences. Embed them anywhere on your web/mobile apps and start
              collecting results like magic.
            </Text>
            <Stack direction={['column-reverse', 'row']}>
              <Button
                as={NextChakraLink}
                href="https://app.typebot.io/register"
                colorScheme="orange"
                size="lg"
                height="4rem"
                px="2rem"
              >
                Create a typebot
              </Button>
              <Button
                as={NextChakraLink}
                href="https://github.com/baptisteArno/typebot.io"
                isExternal={true}
                colorScheme="gray"
                size="lg"
                height="4rem"
                px="2rem"
                variant="outline"
                leftIcon={<GitHubIcon />}
              >
                Star us on GitHub
              </Button>
            </Stack>

            <Text color="gray.400">
              No trial. Generous, unlimited <strong>free</strong> plan.
            </Text>
          </VStack>
          <Box maxW="1200px" pos="relative">
            <Box
              pos="absolute"
              left="-40px"
              bgColor="orange.500"
              boxSize={['150px', '150px', '300px', '600px']}
              rounded="full"
              filter="blur(40px)"
              opacity="0.7"
              className="animated-blob animation-delay-2000"
            />
            <Box
              pos="absolute"
              right="-40px"
              bgColor="blue.500"
              boxSize={['150px', '150px', '300px', '600px']}
              rounded="full"
              filter="blur(40px)"
              opacity="0.7"
              className="animated-blob animation-delay-4000"
            />
            <Box as="figure" shadow="lg">
              <Image
                src={builderScreenshotSrc}
                alt="Builder screenshot"
                placeholder="blur"
              />
            </Box>
          </Box>
        </VStack>
      </Stack>
      <Flex justify="center" bgGradient="linear(to-b, gray.900, gray.800)">
        <VStack spacing="12" pb="32" maxW="7xl" px={4}>
          <Heading fontSize="25px" fontWeight="semibold">
            Loved by teams and creators from all around the world
          </Heading>
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            color="gray.400"
            alignItems="center"
            spacing={12}
            fontSize="4xl"
          >
            <Logos.IbanFirst />
            <Logos.Lemlist />
            <Logos.MakerLead />
            <Logos.Webisharp />
            <Logos.SocialHackrs />
            <Logos.PinpointInteractive />
            <Logos.Obole />
            <Logos.Awwwsome />
          </SimpleGrid>
        </VStack>
      </Flex>
    </Box>
  )
}
