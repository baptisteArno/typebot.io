import { Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import {
  GmailLogo,
  MailChimpLogo,
  NotionLogo,
  WebflowLogo,
  WordpressLogo,
  SlackLogo,
  AirtableLogo,
  GoogleSheetLogo,
  ZapierLogo,
  SalesforceLogo,
  CalendlyLogo,
  GoogleCalendarLogo,
  ShopifyLogo,
  GoogleDriveLogo,
  N8nLogo,
} from 'assets/logos'
import React from 'react'

const firstRowIcons = [
  GmailLogo,
  MailChimpLogo,
  NotionLogo,
  WebflowLogo,
  WordpressLogo,
  GoogleCalendarLogo,
  N8nLogo,
  GoogleDriveLogo,
]
const secondRowIcons = [
  SlackLogo,
  ShopifyLogo,
  AirtableLogo,
  GoogleSheetLogo,
  ZapierLogo,
  CalendlyLogo,
  SalesforceLogo,
]

export const Integrations = () => (
  <Flex as="section" justify="center">
    <Stack w="full" align="center" spacing={12} pt={'52'}>
      <Stack pos="relative" width="1400px" spacing={[4, 12]}>
        <Flex
          pos="absolute"
          left="0"
          w="33%"
          h="full"
          bgGradient="linear(to-r, rgba(23,25,35,1), rgba(23,25,35,0))"
          pointerEvents="none"
          zIndex={100}
        />
        <Flex
          pos="absolute"
          right="0"
          w="33%"
          h="full"
          bgGradient="linear(to-l, rgba(23,25,35,1), rgba(23,25,35,0))"
          pointerEvents="none"
          zIndex={100}
        />
        <HStack w="full" spacing={[4, 16]}>
          {firstRowIcons.map((Icon, idx) => (
            <Flex
              _hover={{ borderColor: 'gray.500' }}
              transition="border 1s ease"
              key={idx}
              rounded="md"
              p="8"
              bgColor="gray.800"
              boxSize="120px"
              justifyContent="center"
              align="center"
              borderWidth="1px"
              data-aos="fade"
              data-aos-delay={idx * 200}
            >
              <Icon w="full" h="full" />
            </Flex>
          ))}
        </HStack>
        <HStack w="full" spacing={[4, 16]} pl={['10', '20']}>
          {secondRowIcons.map((Icon, idx) => (
            <Flex
              key={idx}
              _hover={{ borderColor: 'gray.500' }}
              transition="border 1s ease"
              rounded="md"
              p="8"
              bgColor="gray.800"
              boxSize="120px"
              justifyContent="center"
              align="center"
              borderWidth="1px"
              data-aos="fade"
              data-aos-delay={(secondRowIcons.length - idx) * 200}
            >
              <Icon w="full" h="full" />
            </Flex>
          ))}
        </HStack>
      </Stack>

      <Stack w="full" maxWidth="1200px" px="4">
        <Heading fontSize={['3xl', '4xl']} data-aos="fade-up">
          Integrate with any platform
        </Heading>
        <Text
          color="gray.400"
          maxW="700px"
          fontSize={['lg', 'xl']}
          data-aos="fade-up"
        >
          Typebot offers several native integrations blocks as well as
          instructions on how to embed typebot on particular platforms
        </Text>
      </Stack>
    </Stack>
  </Flex>
)
