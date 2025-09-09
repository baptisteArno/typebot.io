import { Stack } from "@chakra-ui/react";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { ChangePlanForm } from "./ChangePlanForm";
import { CurrentSubscriptionSummary } from "./CurrentSubscriptionSummary";
import { InvoicesList } from "./InvoicesList";
import { UsageProgressBars } from "./UsageProgressBars";

export const BillingSettingsLayout = () => {
  const { workspace, currentUserMode } = useWorkspace();

  if (!workspace) return null;
  return (
    <Stack spacing="10" w="full">
      <UsageProgressBars workspace={workspace} />
      <Stack spacing="4">
        <CurrentSubscriptionSummary workspace={workspace} />
        <ChangePlanForm
          workspace={workspace}
          currentUserMode={currentUserMode}
        />
      </Stack>

      {workspace.stripeId && <InvoicesList workspaceId={workspace.id} />}
    </Stack>
  );
};
