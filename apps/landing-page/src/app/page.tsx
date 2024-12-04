import Image from "next/image";
import gradientSeparatorSrc from "../../public/images/gradient-separator.png";
import { AllFeatures } from "./AllFeatures";
import { CallToActionSection } from "./CallToActionSection";
import { Companies } from "./Companies";
import { Cta } from "./Cta";
import { DesktopHeaderTop } from "./DesktopHeaderTop";
import { Faq } from "./Faq";
import { FloatingHeader } from "./FloatingHeader";
import { Footer } from "./Footer";
import { ForEveryDepartment } from "./ForEveryDepartment";
import { GetStarted } from "./GetStarted";
import { Hero } from "./Hero";
import { JoinTheCommunity } from "./JoinTheCommunity";
import { MadeForDevelopers } from "./MadeForDevelopers";
import { MainFeatures } from "./MainFeatures";
import { ProductPrinciples } from "./ProductPrinciples";
import { Section } from "./Section";
import { Testimonials } from "./Testimonials";
import { TypebotBubble } from "./TypebotBubble";
import { UseCases } from "./UseCases";

export const metadata = {
  title: "Typebot Blog",
  description:
    "The official Typebot blog where we share our thoughts and tips on everything related to chatbots, conversational marketing, customer support and more.",
};

export default function Home() {
  return (
    <div className="flex flex-col items-stretch overflow-hidden">
      <TypebotBubble />
      <FloatingHeader />
      <DesktopHeaderTop className="hidden md:flex" />
      <Section className="dark py-0">
        <Hero />
      </Section>
      <Section
        className="min-h-screen px-0 rounded-t-3xl bg-[url('/images/magic-background.svg')] md:bg-[url('/images/magic-background-desktop.svg')] opacity-0 animate-slide-fade-in bg-no-repeat bg-[length:100%]"
        style={{
          animationDelay: "2.2s",
          animationFillMode: "forwards",
        }}
      >
        <div className="flex flex-col gap-10 px-4">
          <UseCases />
          <CallToActionSection />
        </div>
        <Companies />
        <MainFeatures />
      </Section>
      <Section className="dark">
        <ForEveryDepartment />
      </Section>
      <Section>
        <MadeForDevelopers />
        <JoinTheCommunity />
        <ProductPrinciples />
      </Section>
      <Section className="dark px-0">
        <AllFeatures />
      </Section>
      <Section>
        <GetStarted />
        <Cta />
        <Testimonials />
        <Faq />
      </Section>
      <Image src={gradientSeparatorSrc} alt="separator" className="w-full" />
      <Footer />
    </div>
  );
}
