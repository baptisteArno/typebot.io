import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";
import { TopBar } from "@/features/homepage/hero/TopBar";
import { EnterprisePlanCard } from "@/features/pricing/EnterprisePlanCard";
import { Faq } from "@/features/pricing/Faq";
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
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "@typebot.io/zod";

export const Route = createFileRoute("/pricing")({
  component: RouteComponent,
  validateSearch: z.object({
    isTiersModalOpened: z.boolean().optional(),
  }),
});

function RouteComponent() {
  const { isTiersModalOpened } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const openTiersDialog = () => {
    navigate({
      search: { isTiersModalOpened: true },
      resetScroll: false,
    });
  };
  const closeTiersDialog = () => {
    navigate({
      search: { isTiersModalOpened: undefined },
    });
  };

  return (
    <div className="flex flex-col items-stretch">
      <div className="flex w-full justify-center">
        <TopBar className="hidden md:flex" />
      </div>
      <div className="fixed top-4 md:bottom-12 md:top-auto z-10 w-full">
        <Header />
      </div>
      <div className="flex flex-col items-center w-full px-4 pt-28 md:pt-20 pb-32 gap-24">
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
            <div className="flex flex-col gap-4 md:flex-row w-full justify-around">
              <FreePlanCard />
              <StarterPlanCard />
              <ProPlanCard />
            </div>
          </div>
        </div>
        <Faq />
      </div>
      <Footer />
      <TiersDialog
        isOpened={isTiersModalOpened === true}
        onClose={closeTiersDialog}
      />
    </div>
  );
}
