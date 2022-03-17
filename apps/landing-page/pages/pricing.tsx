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
                  'Custom JS / CSS',
                  'Native integrations (Google Sheets, Webhooks, Zapier...)',
                  'Basic analytics (Sessions, time, completion...)',
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
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  )
}

export default Pricing
