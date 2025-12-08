import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Plan } from "@typebot.io/prisma/enum";
import { Leaf01Icon } from "@typebot.io/ui/icons/Leaf01Icon";
import { useState } from "react";
import { TextLink } from "@/components/TextLink";
import { useUser } from "@/features/user/hooks/useUser";
import type { WorkspaceInApp } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useSubscriptionQuery } from "../hooks/useSubscriptionQuery";
import type { PreCheckoutDialogProps } from "./PreCheckoutDialog";
import { PreCheckoutDialog } from "./PreCheckoutDialog";
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

  const { user } = useUser();
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutDialogProps["selectedSubscription"]>();
  const [pendingUpgrade, setPendingUpgrade] = useState<"STARTER" | "PRO">();

  const { data, refetch } = useSubscriptionQuery(workspace.id);

  const { mutateAsync: updateSubscription, status: updateSubscriptionStatus } =
    useMutation(
      trpc.billing.updateSubscription.mutationOptions({
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
            queryKey: trpc.workspace.getWorkspace.queryKey({
              workspaceId: workspace?.id,
            }),
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
    if (!user) return;

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
      setPreCheckoutPlan(newSubscription);
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
      <div className="flex items-center gap-3 max-w-[500px]">
        <Leaf01Icon className="size-7" />
        <p className="text-xs" color="gray.500">
          {t("billing.contribution.preLink")}{" "}
          <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
            {t("billing.contribution.link")}
          </TextLink>
        </p>
      </div>
      {!workspace.stripeId && (
        <PreCheckoutDialog
          selectedSubscription={preCheckoutPlan}
          existingEmail={user?.email ?? undefined}
          existingCompany={user?.company ?? undefined}
          onClose={() => setPreCheckoutPlan(undefined)}
        />
      )}
      <UpgradeConfirmationDialog
        isOpen={!!pendingUpgrade}
        workspaceId={workspace.id}
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
                isLoading={updateSubscriptionStatus === "pending"}
                currency={data.subscription?.currency}
              />
            )}

            {excludedPlans?.includes("PRO") ? null : (
              <ProPlanPricingCard
                currentPlan={workspace.plan}
                onPayClick={() => handlePayClick(Plan.PRO)}
                isLoading={updateSubscriptionStatus === "pending"}
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
