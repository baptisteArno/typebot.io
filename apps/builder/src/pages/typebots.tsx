import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

export default function Page() {
  const router = useRouter();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!workspace?.id) return;
    router.replace(`/w/${workspace.id}/typebots`);
  }, [workspace?.id, router]);

  if (!workspace?.id)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircleIcon className="animate-spin" />
      </div>
    );

  return null;
}
