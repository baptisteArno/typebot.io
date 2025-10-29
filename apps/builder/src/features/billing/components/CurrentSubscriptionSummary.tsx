import { useTranslate } from "@tolgee/react";
import { Plan } from "@typebot.io/prisma/enum";
import { Alert } from "@typebot.io/ui/components/Alert";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { useSubscriptionQuery } from "../hooks/useSubscriptionQuery";
import { BillingPortalButton } from "./BillingPortalButton";
import { PlanBadge } from "./PlanTag";

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
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl">{t("billing.currentSubscription.heading")}</h2>
      <div
        className="flex items-center gap-2"
        data-testid="current-subscription"
      >
        <p>{t("billing.currentSubscription.subheading")} </p>
        <PlanBadge plan={workspace.plan} />
        {data?.subscription?.cancelDate && (
          <p className="text-sm">
            ({t("billing.currentSubscription.cancelDate")}{" "}
            {data.subscription.cancelDate.toDateString()})
          </p>
        )}
      </div>
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
    </div>
  );
};
