import {
  Box,
  Button,
  chakra,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue as mode,
  VStack,
} from '@chakra-ui/react'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import * as React from 'react'
import { Navbar } from '../../common/Navbar/Navbar'
import { BackgroundPolygons } from './BackgroundPolygons'
import * as Logos from './Brands'
import { Testimonials } from './Testimonials'

export const Hero = () => {
  return (
    <Box as="section" overflow="hidden">
      <Navbar />
      <Stack mx="auto" maxW="7xl" py="10" pos="relative" pb="32" px={[4, 0]}>
        <BackgroundPolygons />
        <VStack mb="20" alignItems="center">
          <VStack pt={['10', '20']} spacing="6">
            <Heading as="h1" size="2xl" textAlign="center" maxW="900px">
              <chakra.span
                bgImage={`url(\"/brush.svg\")`}
                bgSize="cover"
                bgRepeat="no-repeat"
              >
                4x more
              </chakra.span>{' '}
              responses with your forms
            </Heading>
            <Text
              color={'gray.600'}
              fontSize={['lg', 'xl']}
              maxW="700px"
              textAlign="center"
            >
              Typebot offers tools to create high-converting lead forms
              specifically designed for your marketing campaigns
            </Text>
            <Button
              as={NextChakraLink}
              href="https://app.typebot.io/register"
              colorScheme="orange"
              bgColor="#FF8E20"
              _hover={{ bgColor: 'orange.500' }}
              shadow="lg"
              size="lg"
              height="4rem"
              px="2rem"
            >
              Create a typebot for free
            </Button>
          </VStack>
          <Box boxSize={{ base: '20', lg: '8' }} />
          <Testimonials />
        </VStack>
      </Stack>
      <Flex justify="center" bgColor="gray.100">
        <VStack spacing="12" py="20" maxW="7xl" px={4}>
          <Text
            color={mode('gray.600', 'gray.400')}
            fontSize="25px"
            fontWeight="semibold"
          >
            Trusted by 1,200+ companies and freelance marketers
          </Text>
          <SimpleGrid
            columns={{ base: 2, md: 3, lg: 6 }}
            color="gray.500"
            alignItems="center"
            spacing={{ base: '12', lg: '24' }}
            fontSize="4xl"
          >
            <Logos.IbanFirst />
            <Logos.Lemlist />
            <Logos.MakerLead />
            <Logos.SocialHackrs />
            <Logos.PinpointInteractive />
            <Logos.Obole />
          </SimpleGrid>
        </VStack>
      </Flex>
    </Box>
  )
}
