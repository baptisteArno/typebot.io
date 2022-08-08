import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  DarkMode,
  Flex,
  Stack,
  Box,
  Heading,
  VStack,
} from '@chakra-ui/react'
import { Footer } from 'components/common/Footer'
import { Header } from 'components/common/Header/Header'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { BackgroundPolygons } from 'components/Homepage/Hero/BackgroundPolygons'
import { PlanComparisonTables } from 'components/PricingPage/PlanComparisonTables'
import { PricingCard } from 'components/PricingPage/PricingCard'
import { ActionButton } from 'components/PricingPage/PricingCard/ActionButton'
import { useEffect, useState } from 'react'

const Pricing = () => {
  const [price, setPrice] = useState<{
    personalPro: '$39' | '39€' | ''
    team: '$99' | '99€' | ''
  }>({
    personalPro: '',
    team: '',
  })

  useEffect(() => {
    setPrice(
      navigator.languages.find((l) => l.includes('fr'))
        ? { personalPro: '39€', team: '99€' }
        : { personalPro: '$39', team: '$99' }
    )
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
            maxW="1200px"
          >
            <PricingCard
              data={{
                price: 'Free',
                name: 'Personal',
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
                  <ActionButton variant="outline">Get started</ActionButton>
                </NextChakraLink>
              }
            />
            <PricingCard
              data={{
                price: price.personalPro,
                name: 'Personal Pro',
                featureLabel: 'Everything in Personal, plus:',
                features: [
                  'Branding removed',
                  'View incomplete submissions',
                  'In-depth drop off analytics',
                  'Custom domains',
                  'Organize typebots in folders',
                  'File upload input',
                ],
              }}
              borderWidth="3px"
              borderColor="orange.200"
              button={
                <NextChakraLink
                  href="https://app.typebot.io/register?subscribePlan=pro"
                  _hover={{ textDecor: 'none' }}
                >
                  <ActionButton colorScheme="orange">
                    Subscribe now
                  </ActionButton>
                </NextChakraLink>
              }
            />
            <PricingCard
              data={{
                price: price.team,
                name: 'Team',
                featureLabel: 'Everything in Pro, plus:',
                features: [
                  'Unlimited team members',
                  'Collaborative workspace',
                  'Custom roles',
                ],
              }}
              borderWidth="3px"
              borderColor="purple.200"
              button={
                <NextChakraLink
                  href="https://app.typebot.io/register?subscribePlan=team"
                  _hover={{ textDecor: 'none' }}
                >
                  <ActionButton>Subscribe now</ActionButton>
                </NextChakraLink>
              }
            />
          </Stack>
          <VStack maxW="1200px" w="full" spacing={[12, 20]} px="4">
            <Stack w="full" spacing={10} display={['none', 'flex']}>
              <Heading>Compare plans & features</Heading>
              <PlanComparisonTables prices={price} />
            </Stack>
            <VStack w="full" spacing="10">
              <Heading textAlign="center">Frequently asked questions</Heading>
              <Faq />
            </VStack>
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
