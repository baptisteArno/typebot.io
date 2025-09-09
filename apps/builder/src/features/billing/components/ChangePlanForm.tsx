import { HStack, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Plan } from "@typebot.io/prisma/enum";
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
import { StripeClimateLogo } from "./StripeClimateLogo";

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

  const { data, refetch } = useSubscriptionQuery(workspace.id);

  const { mutate: updateSubscription, status: updateSubscriptionStatus } =
    useMutation(
      trpc.billing.updateSubscription.mutationOptions({
        onSuccess: ({ workspace, checkoutUrl }) => {
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
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
              plan: workspace?.plan,
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
      updateSubscription({
        ...newSubscription,
        returnUrl: window.location.href,
      });
    } else {
      setPreCheckoutPlan(newSubscription);
    }
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
      <Text>
        Only workspace admins can change the subscription plan. Contact your
        workspace admin to change the plan.
      </Text>
    );

  return (
    <Stack spacing={6}>
      <HStack maxW="500px">
        <StripeClimateLogo />
        <Text fontSize="xs" color="gray.500">
          {t("billing.contribution.preLink")}{" "}
          <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
            {t("billing.contribution.link")}
          </TextLink>
        </Text>
      </HStack>
      {!workspace.stripeId && (
        <PreCheckoutDialog
          selectedSubscription={preCheckoutPlan}
          existingEmail={user?.email ?? undefined}
          existingCompany={user?.company ?? undefined}
          onClose={() => setPreCheckoutPlan(undefined)}
        />
      )}
      {data && (
        <Stack align="flex-end" spacing={6}>
          <HStack alignItems="stretch" spacing="4" w="full">
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
          </HStack>
        </Stack>
      )}

      <Text color="gray.500">
        {t("billing.customLimit.preLink")}{" "}
        <TextLink href={"https://typebot.io/enterprise-lead-form"} isExternal>
          {t("billing.customLimit.link")}
        </TextLink>
      </Text>
    </Stack>
  );
};
