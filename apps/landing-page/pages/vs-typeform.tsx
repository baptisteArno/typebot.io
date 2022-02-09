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
import { CheckIcon } from 'assets/icons/CheckIcon'
import { CloseIcon } from 'assets/icons/CloseIcon'
import { ArticleCallToAction } from 'components/common/ArticleCta'
import { Footer } from 'components/common/Footer'
import { Navbar } from 'components/common/Navbar/Navbar'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { Yes, No } from 'components/common/TableCells'
import loadTypeform from 'lib/typeform'

const VsTypebot = () => {
  useEffect(() => {
    loadTypeform().then()
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
          title="Typebot vs Typeform"
          description="Get to know the main differences between Typebot and Typeform"
          currentUrl={`https://www.typebot.io/vs-typeform`}
          imagePreviewUrl={`https://www.typebot.io/vs-typeform`}
        />
        <Navbar />
        <VStack maxW="1200px" py={20} spacing={10} w="full">
          <Heading as="h1" fontSize={['3xl', '5xl']} textAlign="center">
            What makes Typebot a great Typeform alternative?
          </Heading>
          <Stack maxW="700px" spacing={6} textAlign="justify" w="full" px={4}>
            <Text>
              I am a big fan of Typeform user experience. This is probably what
              motivated me to create an alternative that keeps Typeform slick
              design but also offers a unique conversational experience that
              would make my forms convert more.
            </Text>
            <Text>
              Along the journey, I figured that a conversational experience also
              unlocks many possibilities in terms of conversion rate
              optimization for marketers. That&apos;s exactly where Typebot is
              headed.
            </Text>
            <Heading>User experience</Heading>
            <Text>
              Here is an example of the same form created with both tools:
            </Text>
            <Heading size="md" as="h3">
              Typeform:
            </Heading>
            <div
              className="typeform-widget"
              data-url="https://form.typeform.com/to/mKiSR43i?typeform-medium=embed-snippet"
              style={{ width: '100%', height: '500px' }}
            />
            <Heading size="md" as="h3">
              Typebot:
            </Heading>
            <div
              id="typebot-container"
              style={{ width: '100%', height: '500px' }}
            />

            <Heading>Conversion increased</Heading>
            <Text>
              Typebot&apos;s users report a better conversion rate compared to
              Typeform forms. All of this is thanks to a conversation :
            </Text>
            <Heading as="h3" size="md">
              Collect real-time results
            </Heading>
            <Text>
              With a Typeform, you collect the answer only when your user clicks
              on the &quot;Submit&quot; button located at end of the form. If
              your users are leaving the form at a specific question, you
              won&apos;t even know this. With Typebot, if a user answers only
              one question, you will still collect the answer and will never
              lose any valuable information.
            </Text>
            <Text>
              What&apos;s the powerful math behind this feature? Imagine 300
              users are interacting with your form but only 100 of them fully
              completed it. With Typebot, you&apos;ll still see responses from
              300 users while with Typeform, you&apos;ll only see responses from
              the 100 people that clicked on &quot;submit&quot;.
            </Text>
            <Heading as="h3" size="md">
              Chat experience is comfortable on mobile
            </Heading>
            <Text>
              Typeform is responsive and looks good on mobile but it still feels
              like a form you need to fill. Whereas with a conversational
              experience, your mind shift and it feels like you&apos;re talking
              to someone.
            </Text>
            <Heading>Pricing</Heading>
            <Text>
              Typeform recently changed its pricing and now offers a Free plan
              that includes meaningful features without limits (logic jumps,
              ending screens, and the number of typeforms you can create). But
              they instead limited the number of responses you can collect per
              month to only 10 and the questions per typeform to 10 as well.
            </Text>
            <Text>
              The problem with these limitations is that you won&apos;t know if
              your forms are actually performing well with only 10 responses per
              month. You&apos;ll be obligated to upgrade to at least their
              &quot;Plus&quot; plan that offers up to 1,000 responses for
              $55/month
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
                    <Th>Typeform (Free plan)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Unlimited forms</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Unlimited logic</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Unlimited responses</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (10 / month)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Unlimited questions</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (10 / form)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Hidden fields</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Calculator</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Templates</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Download your data</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Native integrations</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Collect payments</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $30)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Redirect</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $60)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>File upload</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $30)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Webhooks</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $30)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Custom link preview</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $30)
                      </Text>
                    </Td>
                  </Tr>

                  <Tr>
                    <Td>Custom subdomain</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $50)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Google analytics integration</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $108)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Facebook pixel</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $108)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Google Tag Manager</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $108)
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Priority support</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td display="flex">
                      <CloseIcon width="25px" />
                      <Text ml={1} fontSize="sm">
                        (starts at $108)
                      </Text>
                    </Td>
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
                    <Th>Typeform ($30+/month)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Access to incomplete submissions</Td>
                    <Yes />
                    <No />
                  </Tr>
                  <Tr>
                    <Td>Remove branding</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>$66/month</Td>
                  </Tr>
                  <Tr>
                    <Td>Unlimited file upload</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>$108/month (4GB)</Td>
                  </Tr>

                  <Tr>
                    <Td>Team collaboration</Td>
                    <Td display="flex">
                      <CheckIcon fill="#0042da" width="25px" />
                      <Text ml="1" fontSize="sm">
                        (unlimited)
                      </Text>
                    </Td>
                    <Td>$66 for 3 users</Td>
                  </Tr>
                  <Tr>
                    <Td>Custom domains</Td>
                    <Td>
                      <CheckIcon fill="#0042da" width="25px" />
                    </Td>
                    <Td>
                      <CloseIcon width="25px" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Salesforce integration</Td>
                    <Td>
                      <CloseIcon width="25px" />
                    </Td>
                    <Td>$108/month</Td>
                  </Tr>
                  <Tr>
                    <Td>Schedule a close date</Td>
                    <Td>
                      <CloseIcon width="25px" />
                    </Td>
                    <Td>$108/month</Td>
                  </Tr>
                  <Tr>
                    <Td>Drop-off rates</Td>
                    <Yes />
                    <Td>$108/month</Td>
                  </Tr>
                  <Tr>
                    <Td>Google analytics events</Td>
                    <Yes />
                    <No />
                  </Tr>
                  <Tr>
                    <Td>Organize forms in folders</Td>
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
