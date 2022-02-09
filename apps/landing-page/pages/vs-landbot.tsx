import React, { useEffect } from 'react'
import {
  Heading,
  VStack,
  Stack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Box,
  Flex,
} from '@chakra-ui/react'
import loadLandbot from '../lib/landbot'
import Image from 'next/image'
import Typebot from 'typebot-js'
import { ArticleCallToAction } from 'components/common/ArticleCta'
import { Footer } from 'components/common/Footer'
import { Navbar } from 'components/common/Navbar/Navbar'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { Yes, No } from 'components/common/TableCells'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Landbot: any

const VsTypebot = () => {
  useEffect(() => {
    loadLandbot().then(() => {
      new Landbot.Container({
        container: '#myLandbot',
        configUrl:
          'https://chats.landbot.io/v3/H-937813-ZLZEY720UH1TWN5S/index.json',
      })
    })
    Typebot.initContainer('typebot-container', {
      publishId: 'example-vs-other-tools',
    })
  }, [])
  return (
    <>
      <Stack
        alignItems="center"
        justifyContent="space-between"
        w="full"
        overflowX="hidden"
        mb="20"
      >
        <SocialMetaTags
          title="Typebot vs Landbot"
          description="Get to know the main differences between Typebot and Landbot"
          currentUrl={`https://www.typebot.io/vs-landbot`}
          imagePreviewUrl={`https://www.typebot.io/vs-landbot`}
        />
        <Navbar />
        <VStack maxW="1200px" py={20} spacing={10} w="full">
          <Heading as="h1" fontSize={['3xl', '5xl']} textAlign="center">
            What makes Typebot a great Landbot alternative?
          </Heading>
          <Stack maxW="700px" spacing={6} textAlign="justify" w="full" px={4}>
            <Text>
              Both Landbot and Typebot offer the same output: beautiful
              conversational forms. But Landbot is in fact a tool focused on
              delivering customer service through chatbots while Typebot is
              focused on getting the most out of forms.
            </Text>
            <Heading>User experience</Heading>
            <Text>
              Here is an example of the same form created with both tools:
            </Text>
            <Heading size="md" as="h3">
              Landbot:
            </Heading>
            <div id="myLandbot" style={{ width: '100%', height: '500px' }} />
            <Heading size="md" as="h3">
              Typebot:
            </Heading>
            <div
              id="typebot-container"
              style={{ width: '100%', height: '500px' }}
            />

            <Heading>Building experience</Heading>
            <Text>
              Landbot offers a &quot;visual flow&quot; building experience.
              While it makes conditional logic more understandable. I think
              it&apos;s hard to understand how the final result will look like
              at a glance:
            </Text>
            <Box h="400px" pos="relative">
              <Image
                src="landbotVisualFlowSrc"
                layout="fill"
                objectFit="contain"
                alt="Visual flow screenshot"
              />
            </Box>
            <Text>
              The idea behind Typebot building experience is that you directly
              modify the final result and you click on elements you want to
              edit. Typebot also offer a &quot;visual flow&quot; building
              experience when you start adding doing conditional logic
            </Text>
            <Heading>Pricing</Heading>
            <Text>
              Landbot offers a Free plan that isn&apos;t very generous as you
              won&apos;t have access to advanced useful features and you will be
              limited to 30 chats per month. You won&apos;t really know if your
              forms are performing well with only 30 responses per month.
              You&apos;ll be obligated to upgrade to at least their
              &quot;PROFESSIONAL&quot; plan that offers up to 1,000 responses
              for $95/month.
            </Text>
            <Text>
              Landbot offers a human take-over feature that won&apos;t be
              developed into Typebot. It won&apos;t be a live chat product
              because Typebot is designed for marketers, not customer support
              like Landbot. Typebot&apos;s main focus is to help marketers get
              the most out of their online forms with exclusive features.
            </Text>
            <Text>
              Landbot also offers Facebook and Whatsapp integrations. Typebot
              has planned these integrations but it will be focused on helping
              marketers distribute forms through Facebook and WhatsApp instead
              of a focus on delivering customer service.
            </Text>
            <Heading as="h3" size="md">
              Free plan comparison
            </Heading>
            <Flex overflowY="scroll">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th />
                    <Th>Typebot (Free plan)</Th>
                    <Th>Landbot (Free plan)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Unlimited forms</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Unlimited conversations</Td>
                    <Yes />
                    <No>(30 / month)</No>
                  </Tr>
                  <Tr>
                    <Td>Zapier integration</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Slack integration</Td>
                    <No>Zapier, Integromat</No>
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Sendgrid integration</Td>
                    <No>Zapier, Integromat</No>
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Stripe integration</Td>
                    <Yes />
                    <No>starts at $35</No>
                  </Tr>
                  <Tr>
                    <Td>Google Sheets integration</Td>
                    <Yes />
                    <No>starts at $90</No>
                  </Tr>
                  <Tr>
                    <Td>Human take over</Td>
                    <No />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Priority Support</Td>
                    <Yes />
                    <No>(only enterprise)</No>
                  </Tr>
                  <Tr>
                    <Td>Webhooks</Td>
                    <Yes />
                    <No>starts at $95</No>
                  </Tr>
                  <Tr>
                    <Td>Hidden fields</Td>
                    <Yes />
                    <No>starts at $35</No>
                  </Tr>
                  <Tr>
                    <Td>Conditional logic</Td>
                    <Yes />
                    <No>starts at $35</No>
                  </Tr>
                  <Tr>
                    <Td>Formulas</Td>
                    <Yes />
                    <No>starts at $95</No>
                  </Tr>
                  <Tr>
                    <Td>Custom error messages</Td>
                    <Yes />
                    <No>starts at $35</No>
                  </Tr>
                  <Tr>
                    <Td>Custom typing emulation</Td>
                    <Yes />
                    <No>starts at $35</No>
                  </Tr>
                </Tbody>
              </Table>
            </Flex>
            <Heading as="h3" size="md">
              Paid plan comparison
            </Heading>
            <Flex overflowY="scroll">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th />
                    <Th>Typebot Pro ($30/month)</Th>
                    <Th>Landbot ($35+/month)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Access to incomplete submissions</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Remove branding</Td>
                    <Yes />
                    <Yes>$95/month</Yes>
                  </Tr>
                  <Tr>
                    <Td>Custom domain</Td>
                    <Yes />
                    <No />
                  </Tr>
                  <Tr>
                    <Td>Facebook messenger</Td>
                    <No />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Whatsapp</Td>
                    <No />
                    <Yes>$95+/month</Yes>
                  </Tr>
                  <Tr>
                    <Td>In-depth analytics</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Google analytics events</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Team collaboration</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Organize forms in folders</Td>
                    <Yes />
                    <No />
                  </Tr>
                </Tbody>
              </Table>
            </Flex>
            <Text>
              Landbot offers other very cool features.{' '}
              <NextChakraLink
                href="https://landbot.io/pricing"
                color="blue.400"
              >
                Here is an exhausting list.
              </NextChakraLink>
            </Text>
          </Stack>
        </VStack>
        <ArticleCallToAction />
      </Stack>
      <Footer />
    </>
  )
}

export default VsTypebot
