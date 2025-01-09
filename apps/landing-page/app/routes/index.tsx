import { Header } from "@/components/Header";
import { Section } from "@/components/Section";
import { Cta } from "@/components/cta/Cta";
import { Footer } from "@/components/footer/Footer";
import { AllFeatures } from "@/features/homepage/all-features/AllFeatures";
import { Companies } from "@/features/homepage/companies/components/Companies";
import { Faq } from "@/features/homepage/components/Faq";
import { JoinTheCommunity } from "@/features/homepage/components/JoinTheCommunity";
import { MadeForDevelopers } from "@/features/homepage/components/MadeForDevelopers";
import { ForEveryDepartment } from "@/features/homepage/departments/ForEveryDepartment";
import { GetStarted } from "@/features/homepage/get-started/GetStarted";
import { Hero } from "@/features/homepage/hero/Hero";
import { MainFeatures } from "@/features/homepage/main-features/MainFeatures";
import { ProductPrinciples } from "@/features/homepage/product-principles/ProductPrinciples";
import { Testimonials } from "@/features/homepage/testimonials/Testimonials";
import { UseCases } from "@/features/homepage/use-cases/UseCases";
import { Portal } from "@ark-ui/react/portal";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-stretch">
      {/* <TypebotBubble /> */}
      <Portal>
        <div className="fixed top-4 md:bottom-12 md:top-auto w-full">
          <Header initialAppearance="dark" />
        </div>
      </Portal>
      <Section className="dark py-0 md:py-0 md:px-0 gap-0">
        <Hero />
      </Section>
      <div className="-mt-32 md:-mt-[100vh]">
        <Section className="magic-section px-0 rounded-t-3xl bg-[url('$magicBackgrounds/magic-background.png')] md:bg-[url('$magicBackgrounds/magic-background-desktop.png')] bg-no-repeat bg-[length:100%] motion-opacity-in-0 motion-translate-y-in-[20px] motion-delay-[2500ms] md:pt-32 md:opacity-0">
          <div className="md:h-[200vh]">
            <UseCases className="md:sticky top-0" />
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
        <Section className="dark md:py-0 px-0 md:px-0 gap-0">
          <AllFeatures />
        </Section>
        <Section>
          <GetStarted />
          <Testimonials />
          <Cta />
          <Faq />
        </Section>
        <Footer />
      </div>
    </div>
  );
}
