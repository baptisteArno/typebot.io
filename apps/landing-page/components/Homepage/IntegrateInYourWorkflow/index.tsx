import React from 'react'
import { Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { AirtableLogo } from './icons/airtable'
import { FacebookPixelLogo } from './icons/facebook-pixel'
import { GmailLogo } from './icons/gmail'
import { GoogleSheetLogo } from './icons/google-sheets'
import { GoogleTagManagerLogo } from './icons/google-tag-manager'
import { HubspotLogo } from './icons/hubspot'
import { MailChimpLogo } from './icons/mailchimp'
import { NotionLogo } from './icons/notion'
import { OtherLogo } from './icons/other'
import { SalesforceLogo } from './icons/salesforce'
import { SlackLogo } from './icons/slack'
import { WebflowLogo } from './icons/webflow'
import { WixLogo } from './icons/wix'
import { WordpressLogo } from './icons/wordpress'
import { ZapierLogo } from './icons/zapier'
import { GlobeIcon } from '../../../assets/icons/GlobeIcon'

export const IntegrateInYourWorkflow = () => {
  return (
    <Flex justifyContent="center">
      <Stack
        pt={32}
        w="full"
        px="4"
        spacing={20}
        align={['flex-start', 'center']}
      >
        <Stack spacing="6" align={['flex-start', 'center']}>
          <Flex
            boxSize="50px"
            bgColor="blue.500"
            rounded="lg"
            color="white"
            justify="center"
            align="center"
            shadow="lg"
          >
            <GlobeIcon boxSize="30px" />
          </Flex>
          <Stack>
            <Heading as="h1">
              Integrate it in your workflow in 5 minutes
            </Heading>
            <Text
              color="gray.500"
              size="lg"
              fontWeight="semibold"
              textAlign={['left', 'center']}
            >
              Connect your form to any app in an instant
            </Text>
          </Stack>
          <Text maxW="700px" textAlign={['left', 'center']}>
            Typebot comes with native integrations that allow you to connect
            your form with your existing eco system
          </Text>
        </Stack>

        <SimpleGrid
          columns={5}
          spacing={{ base: 4, lg: 20 }}
          maxW="900px"
          w="full"
        >
          <Flex justifyContent="center" alignItems="center">
            <GoogleSheetLogo width="70%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <SlackLogo width="90%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <HubspotLogo width="90%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <AirtableLogo width="90%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <GmailLogo width="100%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <FacebookPixelLogo width="80%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <GoogleTagManagerLogo width="90%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <MailChimpLogo width="80%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <SalesforceLogo width="100%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <ZapierLogo width="100%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <WordpressLogo width="90%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <WixLogo width="90%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <NotionLogo width="70%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <WebflowLogo width="80%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <OtherLogo width="80%" />
          </Flex>
        </SimpleGrid>
      </Stack>
    </Flex>
  )
}
