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
import { Header } from "@/features/homepage/hero/Header";
import { Hero } from "@/features/homepage/hero/Hero";
import { TopBar } from "@/features/homepage/hero/TopBar";
import { MainFeatures } from "@/features/homepage/main-features/MainFeatures";
import { ProductPrinciples } from "@/features/homepage/product-principles/ProductPrinciples";
import { Testimonials } from "@/features/homepage/testimonials/Testimonials";
import { UseCases } from "@/features/homepage/use-cases/UseCases";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-stretch">
      {/* <TypebotBubble /> */}
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
        className="min-h-screen px-0 rounded-t-3xl bg-[url('$magicBackgrounds/magic-background.svg')] md:bg-[url('$magicBackgrounds/magic-background-desktop.svg')] opacity-0 animate-slide-fade-in bg-no-repeat bg-[length:100%]"
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
  );
}
