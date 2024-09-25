import { EasyBuildingExperience } from "@/components/Homepage/EasyBuildingExperience";
import { EasyEmbed } from "@/components/Homepage/EasyEmbed";
import { EndCta } from "@/components/Homepage/EndCta";
import { Features } from "@/components/Homepage/Features";
import { Hero } from "@/components/Homepage/Hero";
import { Integrations } from "@/components/Homepage/Integrations";
import { IntroducingChatApps } from "@/components/Homepage/IntroducingChatApps";
import { RealTimeResults } from "@/components/Homepage/RealTimeResults";
import { Testimonials } from "@/components/Homepage/Testimonials";
import { Footer } from "@/components/common/Footer";
import { SocialMetaTags } from "@/components/common/SocialMetaTags";
import { Stack } from "@chakra-ui/react";

const App = () => {
  return (
    <Stack w="full" overflowX="hidden" bgColor="gray.900">
      <SocialMetaTags currentUrl={`https://www.typebot.io/`} />
      <Hero />
      <IntroducingChatApps />
      <EasyBuildingExperience />
      <EasyEmbed />
      <Integrations />
      <RealTimeResults />
      <Features />
      <Testimonials />
      <EndCta heading="Improve conversion and user engagement with typebots" />
      <Footer />
    </Stack>
  );
};

export default App;
