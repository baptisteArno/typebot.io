import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BillingPortalButton } from "@/features/billing/components/BillingPortalButton";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

export default function Page() {
  const { replace } = useRouter();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!workspace || workspace.isPastDue) return;
    replace("/typebots");
  }, [replace, workspace]);

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-col items-center w-full h-[calc(100vh - 64px)] justify-center gap-4">
        <TriangleAlertIcon className="size-10" />
        <h2>Your workspace has unpaid invoice(s).</h2>
        <p>Head over to the billing portal to pay it.</p>
        {workspace?.id && <BillingPortalButton workspaceId={workspace?.id} />}
      </div>
    </>
  );
}
