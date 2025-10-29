import { createFileRoute } from "@tanstack/react-router";
import { Cta } from "@/components/cta/Cta";
import { Section } from "@/components/Section";
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
import { createMetaTags } from "@/lib/createMetaTags";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: createMetaTags({
      title: "Typebot",
      description:
        "Typebot is a no-code platform that enables you to effortlessly create and integrate advanced chatbots into websites and chat platforms like WhatsApp.",
      imagePath: "/images/default-og.png",
      path: "",
    }),
  }),
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-stretch">
      <Section className="dark py-0 md:py-0 md:px-0 gap-0">
        <Hero />
      </Section>
      <div className="-mt-24 md:-mt-[120vh]">
        <Section className="relative isolate px-0 rounded-t-3xl motion-opacity-in-0 animate-in fade-in slide-in-from-bottom-[40px] fill-mode-both duration-600 delay-4000 md:animate-none md:pt-32 bg-transparent">
          <div className="motion-safe:md-scroll-magic-container-fade-in absolute inset-0 size-full rounded-t-3xl -z-10 bg-[url('$magicBackgrounds/magic-background.png')] bg-no-repeat bg-size-[100%] md:motion-safe:opacity-0" />
          <div className="md:h-[200vh] motion-safe:md-scroll-use-cases-fade-in md:motion-safe:opacity-0">
            <UseCases className="md:sticky top-0" />
          </div>
          <Companies />
          <div id="magic-animation-separator" className="invisible -mt-32" />
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
      </div>
    </div>
  );
}
