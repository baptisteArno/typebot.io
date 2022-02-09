import { VStack } from '@chakra-ui/layout'
import { DarkMode, Flex, Stack } from '@chakra-ui/react'
import { Footer } from 'components/common/Footer'
import { Navbar } from 'components/common/Navbar/Navbar'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { BackgroundPolygons } from 'components/Homepage/Hero/BackgroundPolygons'
import { PricingCard } from 'components/PricingPage/PricingCard'
import { ActionButton } from 'components/PricingPage/PricingCard/ActionButton'
import Head from 'next/head'
import { useRouter } from 'next/router'

const Pricing = () => {
  const router = useRouter()

  return (
    <Stack overflowX="hidden">
      <Flex
        pos="relative"
        flexDir="column"
        bgColor="blue.500"
        minHeight="100vh"
        alignItems="center"
        pb={40}
      >
        <SocialMetaTags
          title={'Pricing'}
          description={
            "99% of Typebot's features are available to all users for free."
          }
          currentUrl={`https://www.typebot.io/${
            router.locale === 'fr' ? 'fr/' : ''
          }pricing`}
          imagePreviewUrl={`https://www.typebot.io/images/previews/pricing${
            router.locale === 'fr' ? '-fr' : ''
          }.png`}
        />
        <Head>
          <link
            rel="alternate"
            hrefLang="en"
            href="https://www.typebot.io/pricing"
          />
          <link
            rel="alternate"
            hrefLang="fr"
            href="https://www.typebot.io/fr/pricing"
          />
        </Head>

        <BackgroundPolygons />
        <DarkMode>
          <Navbar />
        </DarkMode>

        <VStack spacing={40} w="full">
          <Stack
            direction={['column', 'row']}
            alignItems={['stretch', 'flex-start']}
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
                  'Conditional branching and computations',
                  'Native integrations (Google Sheets, Webhooks, Zapier...)',
                  'Basic analytics (sessions, time, completion...)',
                ],
              }}
              button={
                <NextChakraLink
                  href="https://app.typebot.io/signup"
                  _hover={{ textDecor: 'none' }}
                >
                  <ActionButton variant="outline">Try now</ActionButton>
                </NextChakraLink>
              }
            />
            <PricingCard
              data={{
                price: '$30',
                name: 'Pro',
                features: [
                  'Everything in Basic',
                  'Branding removed',
                  'View incomplete submissions',
                  'In-depth drop off analytics',
                  'Custom domains',
                  'Organize typebots in folders',
                  'Unlimited uploads',
                  'Custom Google Analytics events',
                ],
              }}
              beforeButtonLabel={"The only form builder you'll need"}
              button={
                <NextChakraLink
                  href="https://app.typebot.io/signup?chosen_plan=scale"
                  _hover={{ textDecor: 'none' }}
                >
                  <ActionButton>Subscribe now</ActionButton>
                </NextChakraLink>
              }
            />
          </Stack>
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  )
}

export default Pricing
