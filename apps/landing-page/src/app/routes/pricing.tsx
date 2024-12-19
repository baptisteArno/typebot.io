import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";
import { TopBar } from "@/features/homepage/hero/TopBar";
import { EnterprisePlanCard } from "@/features/pricing/EnterprisePlanCard";
import { PlanComparisonTables } from "@/features/pricing/PlanComparisonsTables";
import { PricingHeading } from "@/features/pricing/PricingHeading";
import { TiersDialog } from "@/features/pricing/TiersDialog";
import {
  FreePlanCard,
  FreePlanPerksList,
} from "@/features/pricing/free-plan-card";
import { ProPerksList, ProPlanCard } from "@/features/pricing/pro-plan-card";
import {
  StarterPlanCard,
  StarterPlanPerksList,
} from "@/features/pricing/starter-plan-card";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(false);

  const openTiersDialog = () => setOpen(true);
  const closeTiersDialog = () => setOpen(false);
  return (
    <div className="flex flex-col items-stretch">
      <div className="flex w-full justify-center">
        <TopBar className="hidden md:flex" />
      </div>
      <div className="fixed top-4 md:bottom-12 md:top-auto z-10 w-full">
        <Header />
      </div>
      <div className="flex flex-col items-center w-full px-4 pt-28 md:pt-20 pb-32">
        <div className="flex flex-col max-w-7xl w-full gap-12 md:gap-20">
          <PricingHeading />
          <div className="flex flex-col gap-8 items-center w-full">
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <FreePlanCard>
                <FreePlanPerksList />
              </FreePlanCard>
              <StarterPlanCard>
                <StarterPlanPerksList />
              </StarterPlanCard>
              <ProPlanCard>
                <ProPerksList onChatsTiersClick={openTiersDialog} />
              </ProPlanCard>
            </div>
            <EnterprisePlanCard />
          </div>
          <div className="flex flex-col gap-8">
            <h2>Compare plans & features</h2>
            <PlanComparisonTables onChatsTiersClick={openTiersDialog} />
          </div>
        </div>
      </div>
      <Footer />
      <TiersDialog open={open} onClose={closeTiersDialog} />
    </div>
  );
}
