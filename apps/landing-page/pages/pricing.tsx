import {
  DarkMode,
  Flex,
  Stack,
  Heading,
  VStack,
  Text,
  HStack,
  Switch,
  Tag,
} from '@chakra-ui/react'
import { Footer } from 'components/common/Footer'
import { Header } from 'components/common/Header/Header'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { BackgroundPolygons } from 'components/Homepage/Hero/BackgroundPolygons'
import { PlanComparisonTables } from 'components/PricingPage/PlanComparisonTables'
import { useState } from 'react'
import { StripeClimateLogo } from 'assets/logos/StripeClimateLogo'
import { FreePlanCard } from 'components/PricingPage/FreePlanCard'
import { StarterPlanCard } from 'components/PricingPage/StarterPlanCard'
import { ProPlanCard } from 'components/PricingPage/ProPlanCard'
import { TextLink } from 'components/common/TextLink'
import { EnterprisePlanCard } from 'components/PricingPage/EnterprisePlanCard'
import { Faq } from 'components/PricingPage/Faq'

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true)

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
          <Stack align="center" spacing="12" w="full" px={4}>
            <VStack>
              <Heading fontSize={{ base: '4xl', xl: '6xl' }}>
                Plans fit for you
              </Heading>
              <Text
                maxW="900px"
                textAlign="center"
                fontSize={{ base: 'lg', xl: 'xl' }}
              >
                Whether you&apos;re a{' '}
                <Text as="span" color="orange.200" fontWeight="bold">
                  solo business owner
                </Text>
                , a{' '}
                <Text as="span" color="blue.200" fontWeight="bold">
                  growing startup
                </Text>{' '}
                or a{' '}
                <Text as="span" fontWeight="bold">
                  large company
                </Text>
                , Typebot is here to help you build high-performing chat forms
                for the right price. Pay for as little or as much usage as you
                need.
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
            <Stack align="flex-end" maxW="1200px" w="full" spacing={4}>
              <HStack>
                <Text>Monthly</Text>
                <Switch
                  isChecked={isYearly}
                  onChange={() => setIsYearly(!isYearly)}
                />
                <HStack>
                  <Text>Yearly</Text>
                  <Tag colorScheme="blue">16% off</Tag>
                </HStack>
              </HStack>

              <Stack
                direction={['column', 'row']}
                alignItems={['stretch']}
                spacing={10}
                w="full"
                maxW="1200px"
              >
                <FreePlanCard />
                <StarterPlanCard isYearly={isYearly} />
                <ProPlanCard isYearly={isYearly} />
              </Stack>
            </Stack>

            <EnterprisePlanCard />
          </Stack>

          <VStack maxW="1200px" w="full" spacing={[12, 20]} px="4">
            <Stack w="full" spacing={10} display={['none', 'flex']}>
              <Heading>Compare plans & features</Heading>
              <PlanComparisonTables />
            </Stack>
            <Faq />
          </VStack>
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  )
}

export default Pricing
