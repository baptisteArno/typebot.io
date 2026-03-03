import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import { useRouter } from "next/router";
import { useState } from "react";
import { TextLink } from "@/components/TextLink";
import type { WorkspaceInApp } from "@/features/workspace/WorkspaceProvider";
import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { orpc, queryClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { ProPlanPricingCard } from "./ProPlanPricingCard";
import { StarterPlanPricingCard } from "./StarterPlanPricingCard";
import { UpgradeConfirmationDialog } from "./UpgradeConfirmationDialog";

type Props = {
  workspace: WorkspaceInApp;
  currentUserMode?: "guest" | "read" | "write";
  excludedPlans?: ("STARTER" | "PRO")[];
};

export const ChangePlanForm = ({
  workspace,
  currentUserMode,
  excludedPlans,
}: Props) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [pendingUpgrade, setPendingUpgrade] = useState<"STARTER" | "PRO">();
  const [pendingCheckoutRedirect, setPendingCheckoutRedirect] = useState<
    "STARTER" | "PRO"
  >();

  const { data, refetch } = useQuery(
    orpc.billing.getSubscription.queryOptions({
      input: { workspaceId: workspace.id },
      enabled: !isSelfHostedInstance(),
    }),
  );

  const { data: pendingUpgradeData, isLoading: isLoadingPendingUpgrade } =
    useQuery(
      orpc.billing.getSubscriptionPreview.queryOptions({
        input: {
          workspaceId: workspace.id,
          plan: pendingUpgrade!,
        },
        enabled: isDefined(pendingUpgrade),
      }),
    );

  const { mutate: createCheckoutSession } = useMutation(
    orpc.billing.createCheckoutSession.mutationOptions({
      onSuccess: (data) => {
        router.push(data.checkoutUrl);
      },
      onError: (error) => {
        setPendingCheckoutRedirect(undefined);
        toast({
          type: "error",
          title: t("errorMessage"),
          description: error.message,
        });
      },
    }),
  );

  const { mutateAsync: updateSubscription, status: updateSubscriptionStatus } =
    useMutation(
      orpc.billing.updateSubscription.mutationOptions({
        onSuccess: (data) => {
          if (data.type === "checkoutUrl") {
            window.location.href = data.checkoutUrl;
            return;
          }
          if (data.type === "error") {
            toast({
              type: "error",
              title: data.title,
              description: data.description ?? undefined,
            });
            return;
          }
          refetch();
          queryClient.invalidateQueries({
            queryKey: orpc.workspace.getWorkspace.key(),
          });
          toast({
            type: "success",
            description: t("billing.updateSuccessToast.description", {
              plan: pendingUpgrade,
            }),
          });
        },
      }),
    );

  const handlePayClick = async (plan: "STARTER" | "PRO") => {
    const newSubscription = {
      plan,
      workspaceId: workspace.id,
    } as const;
    if (workspace.stripeId) {
      const isUpgrade = isUpgradingPlan(workspace.plan, plan);
      if (isUpgrade) {
        setPendingUpgrade(plan);
      } else {
        updateSubscription({
          ...newSubscription,
          returnUrl: window.location.href,
        });
      }
    } else {
      setPendingCheckoutRedirect(plan);
      createCheckoutSession({
        workspaceId: workspace.id,
        returnUrl: window.location.href,
        plan,
      });
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!pendingUpgrade) return;
    await updateSubscription({
      plan: pendingUpgrade,
      workspaceId: workspace.id,
      returnUrl: window.location.href,
    });
  };

  if (
    data?.subscription?.cancelDate ||
    data?.subscription?.status === "past_due"
  )
    return null;

  const isSubscribed =
    (workspace.plan === Plan.STARTER || workspace.plan === Plan.PRO) &&
    workspace.stripeId;

  if (workspace.plan !== Plan.FREE && !isSubscribed) return null;

  if (currentUserMode !== "write")
    return (
      <p>
        Only workspace admins can change the subscription plan. Contact your
        workspace admin to change the plan.
      </p>
    );

  return (
    <div className="flex flex-col gap-6">
      <UpgradeConfirmationDialog
        isOpen={isDefined(pendingUpgradeData)}
        amountDue={pendingUpgradeData?.amountDue ?? 0}
        currency={pendingUpgradeData?.currency ?? "eur"}
        targetPlan={pendingUpgrade}
        onConfirm={handleConfirmUpgrade}
        onClose={() => setPendingUpgrade(undefined)}
      />
      {data && (
        <div className="flex flex-col items-end gap-6">
          <div className="flex items-stretch gap-4 w-full">
            {excludedPlans?.includes("STARTER") ? null : (
              <StarterPlanPricingCard
                currentPlan={workspace.plan}
                onPayClick={() => handlePayClick(Plan.STARTER)}
                isLoading={
                  updateSubscriptionStatus === "pending" ||
                  pendingCheckoutRedirect === "STARTER" ||
                  (isLoadingPendingUpgrade && pendingUpgrade === Plan.STARTER)
                }
                currency={data.subscription?.currency}
              />
            )}

            {excludedPlans?.includes("PRO") ? null : (
              <ProPlanPricingCard
                currentPlan={workspace.plan}
                onPayClick={() => handlePayClick(Plan.PRO)}
                isLoading={
                  updateSubscriptionStatus === "pending" ||
                  pendingCheckoutRedirect === "PRO" ||
                  (isLoadingPendingUpgrade && pendingUpgrade === Plan.PRO)
                }
                currency={data.subscription?.currency}
              />
            )}
          </div>
        </div>
      )}
      <p color="gray.500">
        {t("billing.customLimit.preLink")}{" "}
        <TextLink href={"https://typebot.io/enterprise-lead-form"} isExternal>
          {t("billing.customLimit.link")}
        </TextLink>
      </p>
    </div>
  );
};

const isUpgradingPlan = (
  currentPlan: Plan,
  targetPlan: "STARTER" | "PRO",
): boolean => {
  if (currentPlan === Plan.FREE) {
    return targetPlan === Plan.STARTER || targetPlan === Plan.PRO;
  }
  if (currentPlan === Plan.STARTER) {
    return targetPlan === Plan.PRO;
  }
  return false;
};
