import { ContentPageWrapper } from "@/components/ContentPageWrapper";
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
import { createMetaTags } from "@/lib/createMetaTags";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "@typebot.io/zod";

export const Route = createFileRoute("/_layout/pricing")({
  head: () => ({
    meta: createMetaTags({
      title: "Pricing | Typebot",
      description: "Typebot pricing plans and features.",
      imagePath: "/images/default-og.png",
      path: "/pricing",
    }),
  }),
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
      resetScroll: false,
    });
  };

  return (
    <ContentPageWrapper>
      <div className="flex flex-col items-center w-full gap-24">
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
      <TiersDialog
        open={isTiersModalOpened === true}
        onClose={closeTiersDialog}
      />
    </ContentPageWrapper>
  );
}
