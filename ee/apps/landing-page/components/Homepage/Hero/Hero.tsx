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
import * as React from 'react'
import { Header } from '../../common/Header/Header'
import { BackgroundPolygons } from './BackgroundPolygons'
import * as Logos from './Brands'
import Link from 'next/link'
import Image from 'next/image'
import builderScreenshotSrc from 'public/images/builder-screenshot.png'

export const Hero = () => {
  return (
    <Box as="section" overflow="hidden">
      <Header />
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
              data-aos="fade-up"
            >
              Build advanced chatbots visually
            </Heading>
            <Text
              fontSize={['lg', 'xl']}
              maxW="800px"
              textAlign="center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Typebot gives you powerful blocks to create unique chat
              experiences. Embed them anywhere on your web/mobile apps and start
              collecting results like magic.
            </Text>
            <Stack
              direction={['column-reverse', 'row']}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <Button
                as={Link}
                href="https://app.typebot.io/register"
                colorScheme="orange"
                size="lg"
                height="4rem"
                px="2rem"
              >
                Create a typebot for free
              </Button>
            </Stack>
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
              className="animated-blob"
              data-aos="fade"
              data-aos-delay="1200"
            />
            <Box
              pos="absolute"
              right="-40px"
              bgColor="blue.500"
              boxSize={['150px', '150px', '300px', '600px']}
              rounded="full"
              filter="blur(40px)"
              opacity="0.7"
              className="animated-blob animation-delay-5000"
              data-aos="fade"
              data-aos-delay="1200"
            />
            <Box
              as="figure"
              shadow="lg"
              data-aos="zoom-out-up"
              data-aos-delay="800"
            >
              <Image
                src={builderScreenshotSrc}
                alt="Builder screenshot"
                placeholder="blur"
                style={{ borderRadius: '10px' }}
              />
            </Box>
          </Box>
        </VStack>
      </Stack>
      <Flex justify="center" bgGradient="linear(to-b, gray.900, gray.800)">
        <VStack spacing="12" pb="32" maxW="7xl" px={4}>
          <Heading fontSize="25px" fontWeight="semibold" data-aos="fade">
            Loved by teams and creators from all around the world
          </Heading>
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            color="gray.400"
            alignItems="center"
            spacing={12}
            fontSize="4xl"
            data-aos="fade"
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
