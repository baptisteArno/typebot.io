import { useRouter } from "next/router";
import { useEffect } from "react";
import { TextLink } from "@/components/TextLink";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

export default function Page() {
  const { replace } = useRouter();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!workspace || workspace.isSuspended) return;
    replace("/typebots");
  }, [replace, workspace]);

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-col items-center w-full h-[calc(100vh - 64px)] justify-center gap-4">
        <h2>Your workspace has been suspended.</h2>
        <p>
          We detected that one of your typebots does not comply with our{" "}
          <TextLink
            href="https://typebot.io/terms-of-service#scam-typebots"
            isExternal
          >
            terms of service
          </TextLink>
        </p>
      </div>
    </>
  );
}
