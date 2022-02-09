import React from 'react'
import { Stack } from '@chakra-ui/react'
import Head from 'next/head'
import { Footer } from 'components/common/Footer'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { EndCta } from 'components/Homepage/EndCta'
import { Features } from 'components/Homepage/Features'
import { Hero } from 'components/Homepage/Hero'
import { IntegrateInYourWorkflow } from 'components/Homepage/IntegrateInYourWorkflow'
import { IterateQuickly } from 'components/Homepage/IterateQuickly'
import { MarketingCampaignsRecipe } from 'components/Homepage/MarketingCampaignRecipe'
import { NativeFeeling } from 'components/Homepage/NativeFeeling'
import { DontLooseData } from 'components/Homepage/StopLoosingData'
import { StopSpendingTimeOnBuilding } from 'components/Homepage/StopWastingTimeOnBuilding'

const Homepage = () => {
  return (
    <Stack w="full" overflowX="hidden">
      <SocialMetaTags
        title="Typebot: Conversational Form Builder"
        description="Convert 4x more with beautiful conversational forms. Embed them directly in your applications without a line of code."
        currentUrl={`https://www.typebot.io/`}
        imagePreviewUrl={`https://www.typebot.io/images/previews/home.png`}
      />
      <Head>
        <link rel="alternate" hrefLang="en" href="https://www.typebot.io/" />
        <link rel="alternate" hrefLang="fr" href="https://www.typebot.io/fr" />
      </Head>
      <Hero />
      <MarketingCampaignsRecipe />
      <DontLooseData />
      <IterateQuickly />
      <StopSpendingTimeOnBuilding />
      <IntegrateInYourWorkflow />
      <NativeFeeling />
      <Features />
      <EndCta />
      <Footer />
    </Stack>
  )
}

export default Homepage
