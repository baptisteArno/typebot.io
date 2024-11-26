import { CallToActionSection } from "./CallToActionSection";
import { Companies } from "./Companies";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { MainFeatures } from "./MainFeatures";
import { TypebotBubble } from "./TypebotBubble";
import { UseCases } from "./UseCases";

export const metadata = {
  title: "Typebot Blog",
  description:
    "The official Typebot blog where we share our thoughts and tips on everything related to chatbots, conversational marketing, customer support and more.",
};

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">
      <TypebotBubble />
      <Header />
      <div className="dark section">
        <Hero />
      </div>
      <div
        className="section flex flex-col bg-gray-1 min-h-screen rounded-t-3xl bg-[url('/images/magicBackgroundDesktop.svg')] pt-20 gap-20 opacity-0 animate-slide-fade-in bg-no-repeat bg-[length:100%]"
        style={{
          animationDelay: "2s",
          animationFillMode: "forwards",
        }}
      >
        <div className="flex flex-col gap-10 px-4">
          <UseCases />
          <CallToActionSection />
        </div>
        <Companies />
        <MainFeatures />
      </div>
    </div>
    // <Stack
    //   bgColor="gray.950"
    //   color="gray.100"
    //   overflowY="auto"
    //   gap={0}
    //   overflow="hidden"
    // >
    //   <TypebotBubble />
    //   <Header />
    //   <Theme appearance="dark">
    //     <Hero />
    //   </Theme>
    //   <Theme appearance="light" bgColor="gray.950">
    //     <VStack
    //       minH="100vh"
    //       bgColor="gray.100"
    //       color="gray.950"
    //       borderTopRadius="3xl"
    //       backgroundImage={{
    //         base: "url(/images/magicBackground.svg)",
    //         md: "url(/images/magicBackgroundDesktop.svg)",
    //       }}
    //       backgroundPosition="0 0"
    //       backgroundSize="100%"
    //       backgroundRepeat="no-repeat"
    //       pt="20"
    //       gap={20}
    //       opacity={0}
    //       animation="slide-fade-in 200ms ease-out"
    //       animationDelay="2s"
    //       animationFillMode="forwards"
    //     >
    //       <Stack gap={10} px="4">
    //         <UseCases />
    //         <CallToActionSection />
    //       </Stack>

    //       <Companies />

    //       <MainFeatures />
    //     </VStack>
    //   </Theme>
    //   <ForEveryDepartment />
    // </Stack>
  );
}
