import { Stack } from '@chakra-ui/react'
import { Footer } from 'components/common/Footer'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import { EasyBuildingExperience } from 'components/Homepage/EasyBuildingExperience'
import { EasyEmbed } from 'components/Homepage/EasyEmbed'
import { EndCta } from 'components/Homepage/EndCta'
import { Features } from 'components/Homepage/Features'
import { Hero } from 'components/Homepage/Hero'
import { Integrations } from 'components/Homepage/Integrations'
import { IntroducingChatApps } from 'components/Homepage/IntroducingChatApps'
import { RealTimeResults } from 'components/Homepage/RealTimeResults'
import { Testimonials } from 'components/Homepage/Testimonials'

const App = () => {
  return (
    <Stack w="full" overflowX="hidden" bgColor="gray.900">
      <SocialMetaTags
        title="Typebot: Conversational Form Builder"
        description="Convert 4x more with beautiful conversational forms. Embed them directly in your applications without a line of code."
        currentUrl={`https://www.typebot.io/`}
        imagePreviewUrl={`https://www.typebot.io/images/previews/home.png`}
      />
      <Hero />
      <IntroducingChatApps />
      <EasyBuildingExperience />
      <EasyEmbed />
      <Integrations />
      <RealTimeResults />
      <Features />
      <Testimonials />
      <EndCta />
      <Footer />
    </Stack>
  )
}

export default App
