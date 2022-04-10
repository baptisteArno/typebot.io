import React, { ReactNode } from 'react'

import {
  Box,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { NextChakraLink } from './nextChakraAdapters/NextChakraLink'
import { Logo } from 'assets/icons/Logo'

const facebookGroupUrl = 'https://www.facebook.com/groups/typebot'
const typebotLinkedInUrl = 'https://www.linkedin.com/company/typebot'
const typebotTwitterUrl = 'https://twitter.com/Typebot_io'
const baptisteTwitterUrl = 'https://twitter.com/baptisteArno'
export const contactUrl = 'https://bot.typebot.io/landing-page-bubble-en'
export const roadmapLink = 'https://app.typebot.io/feedback'
export const documentationLink = 'https://docs.typebot.io'
export const githubRepoLink = 'https://github.com/baptisteArno/typebot.io'

export const Footer = () => {
  return (
    <Box w="full">
      <Container as={Stack} maxW={'1000px'} py={10}>
        <SimpleGrid columns={[1, 2, 4]} spacing={8} px={2}>
          <Stack spacing={6}>
            <HStack>
              <Logo boxSize="30px" />
              <Heading as="p" fontSize="lg">
                Typebot
              </Heading>
            </HStack>
            <Text>
              Made with ❤️ by{' '}
              <NextChakraLink href={baptisteTwitterUrl} color="gray.400">
                @baptisteArno
              </NextChakraLink>
            </Text>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Product</ListHeader>
            <NextChakraLink
              href={documentationLink}
              isExternal
              color="gray.400"
            >
              Documentation
            </NextChakraLink>
            <NextChakraLink href={roadmapLink} isExternal color="gray.400">
              Roadmap
            </NextChakraLink>
            <NextChakraLink href={'/pricing'} color="gray.400">
              Pricing
            </NextChakraLink>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Community</ListHeader>
            <NextChakraLink href={githubRepoLink} isExternal color="gray.400">
              GitHub repository
            </NextChakraLink>
            <NextChakraLink href={facebookGroupUrl} isExternal color="gray.400">
              Facebook Group
            </NextChakraLink>
            <NextChakraLink
              href={typebotTwitterUrl}
              isExternal
              color="gray.400"
            >
              Twitter
            </NextChakraLink>
            <NextChakraLink
              href={typebotLinkedInUrl}
              isExternal
              color="gray.400"
            >
              LinkedIn
            </NextChakraLink>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <NextChakraLink href="/about" color="gray.400">
              About
            </NextChakraLink>
            <NextChakraLink href="mailto:baptiste@typebot.io" color="gray.400">
              Contact
            </NextChakraLink>
            <NextChakraLink href={'/terms-of-service'} color="gray.400">
              Terms of Service
            </NextChakraLink>
            <NextChakraLink href={'/privacy-policies'} color="gray.400">
              Privacy Policy
            </NextChakraLink>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

const ListHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Heading fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Heading>
  )
}
