import { Header } from "@/components/Header";
import { Section } from "@/components/Section";
import { Footer } from "@/components/footer/Footer";
import { EnterprisePlanCard } from "@/features/pricing/EnterprisePlanCard";
import { FreePlanCard } from "@/features/pricing/FreePlanCard";
import { PricingHeading } from "@/features/pricing/PricingHeading";
import { ProPlanCard } from "@/features/pricing/ProPlanCard";
import { StarterPlanCard } from "@/features/pricing/StarterPricingCard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-stretch">
      <div className="fixed top-4 md:bottom-12 md:top-auto z-10 w-full">
        <Header />
      </div>
      <Section className="gap-12">
        <PricingHeading />
        <div className="flex flex-col gap-8 items-center w-full">
          <div className="flex flex-col md:flex-row gap-12 w-full">
            <FreePlanCard />
            <StarterPlanCard />
            <ProPlanCard />
          </div>
          <EnterprisePlanCard />
        </div>
      </Section>
      <Footer />
    </div>
  );
}
