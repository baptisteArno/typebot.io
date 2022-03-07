import React, { ReactNode } from 'react'

import { Box, Container, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { NextChakraLink } from './nextChakraAdapters/NextChakraLink'
import { Logo } from 'assets/icons/Logo'

const facebookGroupUrl = 'https://www.facebook.com/groups/typebot'
const typebotLinkedInUrl = 'https://www.linkedin.com/company/typebot'
const typebotTwitterUrl = 'https://twitter.com/Typebot_io'
export const contactUrl = 'https://bot.typebot.io/landing-page-bubble-en'
export const roadmapLink = 'https://app.typebot.io/feedback'

export const Footer = () => {
  return (
    <Box w="full" bgColor="gray.50">
      <Container as={Stack} maxW={'1000px'} py={10}>
        <SimpleGrid columns={[1, 2, 5]} spacing={8} px={2}>
          <Stack spacing={6}>
            <Box>
              <Logo boxSize="30px" />
            </Box>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Product</ListHeader>
            <NextChakraLink href={roadmapLink} isExternal>
              Roadmap
            </NextChakraLink>
            <NextChakraLink href={'/blog'}>Blog</NextChakraLink>
            <NextChakraLink href={'/pricing'}>Pricing</NextChakraLink>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Comparisons</ListHeader>
            <NextChakraLink href="/vs-typeform">VS Typeform</NextChakraLink>
            <NextChakraLink href="/vs-landbot">VS Landbot</NextChakraLink>
            <NextChakraLink href="/vs-tally">VS Tally</NextChakraLink>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Community</ListHeader>
            <NextChakraLink href={facebookGroupUrl} isExternal>
              Facebook Group
            </NextChakraLink>
            <NextChakraLink href={typebotTwitterUrl} isExternal>
              Twitter
            </NextChakraLink>
            <NextChakraLink href={typebotLinkedInUrl} isExternal>
              LinkedIn
            </NextChakraLink>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <NextChakraLink href="mailto:baptiste@typebot.io">
              Contact
            </NextChakraLink>
            <NextChakraLink href={'/terms-of-service'}>
              Terms of Service
            </NextChakraLink>
            <NextChakraLink href={'/privacy-policies'}>
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
