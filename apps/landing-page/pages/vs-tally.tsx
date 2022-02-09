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
  Flex,
} from '@chakra-ui/react'
import Typebot from 'typebot-js'
import { ArticleCallToAction } from 'components/common/ArticleCta'
import { roadmapLink, Footer } from 'components/common/Footer'
import { Navbar } from 'components/common/Navbar/Navbar'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { Yes, No } from 'components/common/TableCells'

const VsTypebot = () => {
  useEffect(() => {
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
          title="Tally vs Typebot"
          description="Get to know the main differences between Typebot and Tally"
          currentUrl={`https://www.typebot.io/vs-typeform`}
          imagePreviewUrl={`https://www.typebot.io/vs-typeform`}
        />
        <Navbar />
        <VStack maxW="1200px" py={20} spacing={10} w="full">
          <Heading as="h1" fontSize={['3xl', '5xl']} textAlign="center">
            What makes Typebot a great Tally alternative?
          </Heading>
          <Stack maxW="700px" spacing={6} textAlign="justify" w="full" px={4}>
            <Text>
              Tally user experience is quite unique and is similar to Notion. I
              love the simplicity of its building experience. Tally and Typebot
              seem to have the same vision for the building experience: what you
              edit is the final result. They also offer similar generous pricing
              where the majority of the features are available for free.
            </Text>
            <Text>
              But these tools differ in the end-user experience: Tally offers
              one-page or multi-step forms whereas Typebot offers a
              conversational experience. Let&apos;s take a look at it:
            </Text>
            <Heading>User experience</Heading>
            <Text>
              Here is an example of the same form created with both tools:
            </Text>
            <Heading size="md" as="h3">
              Tally:
            </Heading>
            <div
              className="typeform-widget"
              data-url="https://form.typeform.com/to/mKiSR43i?typeform-medium=embed-snippet"
              style={{ width: '100%', height: '500px' }}
            >
              <iframe
                src="https://tally.so/embed/nP9Gbm?hideTitle=1&alignLeft=1"
                width="100%"
                height="100%"
                title="Request a class"
              />
            </div>
            <Heading size="md" as="h3">
              Typebot:
            </Heading>
            <div
              id="typebot-container"
              style={{ width: '100%', height: '500px' }}
            />

            <Heading>Conversion increased</Heading>
            <Text>
              I built Typebot because I know conversational experience allows
              you to increase your conversion rate and ultimately offer a more
              comfortable experience on mobile.
            </Text>
            <Heading as="h3" size="md">
              Chat experience is comfortable on mobile
            </Heading>
            <Text>
              Tally looks great on mobile but it still feels like a classic form
              with lots of questions you have to fill. Whereas with a
              conversational experience, your mind shift and it feels like
              you&apos;re talking to someone.
            </Text>
            <Heading>Roadmap Ceiling</Heading>
            <Text>
              Because Tally is offering traditional formatting of its forms,
              they won&apos;t be able to implement advanced features such as
              drop-off rates on a question basis. This feature (available on
              Typebot) is a game-changer for marketers who need to know in
              real-time how their questions perform and where users tend to quit
              the form.
            </Text>
            <Heading>Pricing</Heading>
            <Text>
              Both tools offer similar pricing. Everything is unlimited and for
              free. You&apos;ll need to subscribe only if you need advanced
              features and remove the branding.
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
                    <Th>Tally (Free plan)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Unlimited forms</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Unlimited responses</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Collect payments</Td>
                    <Yes />
                    <Yes>5% commission</Yes>
                  </Tr>
                  <Tr>
                    <Td>File upload</Td>
                    <No>
                      <NextChakraLink href={roadmapLink} color="blue.400">
                        Roadmap
                      </NextChakraLink>
                    </No>
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Calculator</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Hidden fields</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Zapier</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Integromat</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Google Sheets</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Redirect</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Custom subdomain</Td>
                    <Yes />
                    <No />
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
                    <Th>Tally ($29/month)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Collaboration</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Remove branding</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Custom domains</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Workspaces</Td>
                    <Yes />
                    <Yes />
                  </Tr>
                  <Tr>
                    <Td>Access to incomplete submissions</Td>
                    <Yes />
                    <No />
                  </Tr>
                  <Tr>
                    <Td>In-depth analytics</Td>
                    <Yes />
                    <No />
                  </Tr>
                  <Tr>
                    <Td>Google analytics events</Td>
                    <Yes />
                    <No />
                  </Tr>
                </Tbody>
              </Table>
            </Flex>
          </Stack>
        </VStack>
        <ArticleCallToAction />
      </Stack>
      <Footer />
    </>
  )
}

export default VsTypebot
