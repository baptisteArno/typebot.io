import { Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Plan } from "@typebot.io/prisma/enum";
import { Alert } from "@typebot.io/ui/components/Alert";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { useSubscriptionQuery } from "../hooks/useSubscriptionQuery";
import { BillingPortalButton } from "./BillingPortalButton";
import { PlanTag } from "./PlanTag";

type Props = {
  workspace: Pick<Workspace, "id" | "plan" | "stripeId">;
};

export const CurrentSubscriptionSummary = ({ workspace }: Props) => {
  const { t } = useTranslate();

  const { data } = useSubscriptionQuery(workspace.id);

  const isSubscribed =
    (workspace.plan === Plan.STARTER || workspace.plan === Plan.PRO) &&
    workspace.stripeId;

  return (
    <Stack spacing="4">
      <Heading fontSize="3xl">
        {t("billing.currentSubscription.heading")}
      </Heading>
      <HStack data-testid="current-subscription">
        <Text>{t("billing.currentSubscription.subheading")} </Text>
        <PlanTag plan={workspace.plan} />
        {data?.subscription?.cancelDate && (
          <Text fontSize="sm">
            ({t("billing.currentSubscription.cancelDate")}{" "}
            {data.subscription.cancelDate.toDateString()})
          </Text>
        )}
      </HStack>
      {data?.subscription?.status === "past_due" && (
        <Alert.Root variant="error">
          <TriangleAlertIcon />
          <Alert.Description>
            {t("billing.currentSubscription.pastDueAlert")}
          </Alert.Description>
        </Alert.Root>
      )}

      {isSubscribed && (
        <BillingPortalButton
          workspaceId={workspace.id}
          variant={
            data?.subscription?.status === "past_due" ? "default" : "secondary"
          }
        />
      )}
    </Stack>
  );
};
