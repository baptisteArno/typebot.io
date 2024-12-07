import Image from "next/image";
import gradientSeparatorSrc from "../../public/images/gradient-separator.png";
import { AllFeatures } from "./AllFeatures";
import { Companies } from "./Companies";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { ForEveryDepartment } from "./ForEveryDepartment";
import { GetStarted } from "./GetStarted";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { JoinTheCommunity } from "./JoinTheCommunity";
import { MadeForDevelopers } from "./MadeForDevelopers";
import { MainFeatures } from "./MainFeatures";
import { ProductPrinciples } from "./ProductPrinciples";
import { Section } from "./Section";
import { Testimonials } from "./Testimonials";
import { TopBar } from "./TopBar";
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
      <div className="fixed top-4 md:bottom-12 md:top-auto z-10 w-full">
        <Header />
      </div>
      <div className="flex w-full justify-center absolute top-4">
        <TopBar className="hidden md:flex" />
      </div>
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
        <UseCases />
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
