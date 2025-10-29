import { useMutation } from "@tanstack/react-query";
import { Button } from "@typebot.io/ui/components/Button";
import { Label } from "@typebot.io/ui/components/Label";
import { Radio, RadioGroup } from "@typebot.io/ui/components/RadioGroup";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import { useRouter } from "next/router";
import { useState } from "react";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { PlanBadge } from "@/features/billing/components/PlanTag";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";

const Page = () => {
  const { push } = useRouter();
  const { typebot } = useTypebot();
  const { workspaces } = useWorkspace();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>();
  const { mutate, status } = useMutation(
    trpc.typebot.importTypebot.mutationOptions({
      onSuccess: (data) => {
        push(`/typebots/${data.typebot.id}/edit`);
      },
    }),
  );

  const duplicateTypebot = (workspaceId: string) => {
    mutate({ workspaceId, typebot });
  };

  const updateSelectedWorkspaceId = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };

  return (
    <div className="flex w-full justify-center items-center pt-10 h-screen">
      <div className="bg-gray-1 gap-4 max-w-400px mx-auto p-6 rounded-lg border flex flex-col">
        <p>
          Choose a workspace to duplicate <strong>{typebot?.name}</strong> in:
        </p>
        <RadioGroup
          className="flex-col"
          value={selectedWorkspaceId}
          onValueChange={(value) => updateSelectedWorkspaceId(value as string)}
        >
          {workspaces?.map((workspace) => (
            <Label
              key={workspace.id}
              className="hover:bg-gray-2/50 rounded-md p-2 border flex-1 flex justify-center"
            >
              <Radio value={workspace.id} className="hidden" />
              <EmojiOrImageIcon
                icon={workspace.icon}
                size="sm"
                defaultIcon={HardDriveIcon}
              />
              {workspace.name}
              <PlanBadge plan={workspace.plan} />
            </Label>
          ))}
        </RadioGroup>
        <Button
          disabled={!selectedWorkspaceId || status === "pending"}
          onClick={() => duplicateTypebot(selectedWorkspaceId as string)}
        >
          Duplicate
        </Button>
      </div>
    </div>
  );
};

export default Page;
