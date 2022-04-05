import { Box, Heading, VStack } from '@chakra-ui/layout'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  DarkMode,
  Flex,
  Stack,
} from '@chakra-ui/react'
import { Footer } from 'components/common/Footer'
import { Header } from 'components/common/Header/Header'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { BackgroundPolygons } from 'components/Homepage/Hero/BackgroundPolygons'
import { PricingCard } from 'components/PricingPage/PricingCard'
import { ActionButton } from 'components/PricingPage/PricingCard/ActionButton'
import { useEffect, useState } from 'react'

const Pricing = () => {
  const [price, setPrice] = useState<'$30' | '25€' | ''>('')

  useEffect(() => {
    setPrice(navigator.languages.find((l) => l.includes('fr')) ? '25€' : '$30')
  }, [])

  return (
    <Stack overflowX="hidden" bgColor="gray.900">
      <Flex
        pos="relative"
        flexDir="column"
        minHeight="100vh"
        alignItems="center"
        bgGradient="linear(to-b, gray.900, gray.800)"
        pb={40}
      >
        <SocialMetaTags currentUrl={`https://www.typebot.io/pricing`} />
        <BackgroundPolygons />
        <DarkMode>
          <Header />
        </DarkMode>

        <VStack spacing={40} w="full">
          <Stack
            direction={['column', 'row']}
            alignItems={['stretch']}
            spacing={10}
            px={[4, 0]}
            mt={[20, 32]}
            w="full"
            maxW="900px"
          >
            <PricingCard
              data={{
                price: 'Free',
                name: 'Basic',
                features: [
                  'Unlimited typebots',
                  'Unlimited responses',
                  'Native integrations',
                  'Webhooks',
                  'Custom Javascript & CSS',
                ],
              }}
              button={
                <NextChakraLink
                  href="https://app.typebot.io/register"
                  _hover={{ textDecor: 'none' }}
                >
                  <ActionButton variant="outline">Try now</ActionButton>
                </NextChakraLink>
              }
            />
            <PricingCard
              data={{
                price,
                name: 'Pro',
                features: [
                  'Everything in Basic',
                  'Branding removed',
                  'View incomplete submissions',
                  'In-depth drop off analytics',
                  'Custom domains',
                  'Organize typebots in folders',
                  'Unlimited uploads',
                ],
              }}
              borderWidth="3px"
              borderColor="orange.200"
              button={
                <NextChakraLink
                  href="https://app.typebot.io/register?subscribe=true"
                  _hover={{ textDecor: 'none' }}
                >
                  <ActionButton colorScheme="orange">
                    Subscribe now
                  </ActionButton>
                </NextChakraLink>
              }
            />
          </Stack>
          <VStack w="full" maxW="900px" spacing="10" px="4">
            <Heading textAlign="center">Frequently asked questions</Heading>
            <Faq />
          </VStack>
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  )
}

const Faq = () => {
  return (
    <Accordion w="full" allowToggle defaultIndex={0}>
      <AccordionItem>
        <Heading as="h2">
          <AccordionButton py="6">
            <Box flex="1" textAlign="left" fontSize="2xl">
              How can I use Typebot with my team?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          Typebot allows you to invite your colleagues to collaborate on any of
          your typebot. You can give him access as a reader or an editor. Your
          colleague's account can be a free account. <br />
          <br />
          I'm working on a better solution for teams with shared workspaces and
          other team-oriented features.
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <Heading as="h2">
          <AccordionButton py="6">
            <Box flex="1" textAlign="left" fontSize="2xl">
              How many seats will I have with the Pro plan?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          You'll have only one seat. You can invite your colleagues to
          collaborate on your typebots even though they have a free account.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <Heading as="h2">
          <AccordionButton py="6">
            <Box flex="1" textAlign="left" fontSize="2xl">
              Why is there no trial?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          For now, Typebot offers a Freemium based business model. My goal is to
          make sure you have time to create awesome bots and collect valuable
          results. If you need advanced features then you can upgrade any time.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <Heading as="h2">
          <AccordionButton py="6">
            <Box flex="1" textAlign="left" fontSize="2xl">
              If I change my mind, can I get a refund?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          Sure! Just{' '}
          <NextChakraLink
            href="mailto:baptiste@typebot.io"
            textDecor="underline"
          >
            shoot me an email
          </NextChakraLink>{' '}
          and we'll figure things out 😀
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default Pricing
