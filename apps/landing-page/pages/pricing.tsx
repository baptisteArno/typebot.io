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
  Text,
  HStack,
} from '@chakra-ui/react'
import { Footer } from 'components/common/Footer'
import { Header } from 'components/common/Header/Header'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { BackgroundPolygons } from 'components/Homepage/Hero/BackgroundPolygons'
import { PlanComparisonTables } from 'components/PricingPage/PlanComparisonTables'
import { useEffect, useState } from 'react'
import { formatPrice, prices } from 'utils'
import { StripeClimateLogo } from 'assets/logos/StripeClimateLogo'
import { FreePlanCard } from 'components/PricingPage/FreePlanCard'
import { StarterPlanCard } from 'components/PricingPage/StarterPlanCard'
import { ProPlanCard } from 'components/PricingPage/ProPlanCard'
import { TextLink } from 'components/common/TextLink'

const Pricing = () => {
  const [starterPrice, setStarterPrice] = useState('$39')
  const [proPrice, setProPrice] = useState('$89')

  useEffect(() => {
    setStarterPrice(formatPrice(prices.STARTER))
    setProPrice(formatPrice(prices.PRO))
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

        <VStack spacing={'24'} mt={[20, 32]} w="full">
          <Stack align="center" spacing="12" w="full">
            <VStack>
              <Heading fontSize="6xl">Plans fit for you</Heading>
              <Text maxW="900px" fontSize="xl" textAlign="center">
                Whether you're a{' '}
                <Text as="span" color="orange.200" fontWeight="bold">
                  solo business owner
                </Text>{' '}
                or a{' '}
                <Text as="span" color="blue.200" fontWeight="bold">
                  growing startup
                </Text>
                , Typebot is here to help you build high-performing bots for the
                right price. Pay for as little or as much usage as you need.
              </Text>
            </VStack>

            <HStack
              maxW="500px"
              spacing="4"
              bgColor="gray.800"
              p="4"
              rounded="md"
            >
              <StripeClimateLogo />
              <Text fontSize="sm">
                Typebot is contributing 1% of your subscription to remove CO₂
                from the atmosphere.{' '}
                <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
                  More info
                </TextLink>
              </Text>
            </HStack>
            <Stack
              direction={['column', 'row']}
              alignItems={['stretch']}
              spacing={10}
              px={[4, 0]}
              w="full"
              maxW="1200px"
            >
              <FreePlanCard />
              <StarterPlanCard />
              <ProPlanCard />
            </Stack>
            <Text fontSize="lg">
              Need custom limits? Specific features?{' '}
              <TextLink href={'https://typebot.io/enterprise-lead-form'}>
                Let's chat!
              </TextLink>
            </Text>
          </Stack>

          <VStack maxW="1200px" w="full" spacing={[12, 20]} px="4">
            <Stack w="full" spacing={10} display={['none', 'flex']}>
              <Heading>Compare plans & features</Heading>
              <PlanComparisonTables
                starterPrice={starterPrice}
                proPrice={proPrice}
              />
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
              What happens once I reach the monthly chats limit?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          You will receive an email notification once you reached 80% of this
          limit. Then, once you reach 100%, the bot will be closed to new users.
          Upgrading your limit will automatically reopen the bot.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <Heading as="h2">
          <AccordionButton py="6">
            <Box flex="1" textAlign="left" fontSize="2xl">
              What happens once I reach the storage limit?
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          You will receive an email notification once you reached 80% of this
          limit. Then, once you reach 100%, your users will still be able to
          chat with your bot but their uploads won't be stored anymore. You will
          need to upgrade the limit or free up some space to continue collecting
          your users' files.
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
          <TextLink href="mailto:baptiste@typebot.io">
            shoot me an email
          </TextLink>{' '}
          and we'll figure things out 😀
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default Pricing
