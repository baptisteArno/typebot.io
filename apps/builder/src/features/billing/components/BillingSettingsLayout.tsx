import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { ChangePlanForm } from "./ChangePlanForm";
import { CurrentSubscriptionSummary } from "./CurrentSubscriptionSummary";
import { InvoicesList } from "./InvoicesList";
import { UsageProgressBars } from "./UsageProgressBars";

export const BillingSettingsLayout = () => {
  const { workspace, currentUserMode } = useWorkspace();

  if (!workspace) return null;
  return (
    <div className="flex flex-col gap-10 w-full">
      <UsageProgressBars workspace={workspace} />
      <div className="flex flex-col gap-4">
        <CurrentSubscriptionSummary workspace={workspace} />
        <ChangePlanForm
          workspace={workspace}
          currentUserMode={currentUserMode}
        />
      </div>
      {workspace.stripeId && <InvoicesList workspaceId={workspace.id} />}
    </div>
  );
};
