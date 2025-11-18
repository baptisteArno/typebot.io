import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { Download01Icon } from "@typebot.io/ui/icons/Download01Icon";
import { GridViewIcon } from "@typebot.io/ui/icons/GridViewIcon";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { useRouter } from "next/router";
import { useState } from "react";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { ImportTypebotFromFileButton } from "./ImportTypebotFromFileButton";
import { TemplatesDialog } from "./TemplatesDialog";

export const CreateNewTypebotButtons = () => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { user } = useUser();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useOpenControls();

  const [isLoading, setIsLoading] = useState(false);

  const { mutate: createTypebot } = useMutation(
    trpc.typebot.createTypebot.mutationOptions({
      onMutate: () => {
        setIsLoading(true);
      },
      onSuccess: (data) => {
        router.push({
          pathname: `/typebots/${data.typebot.id}/edit`,
        });
      },
      onSettled: () => {
        setIsLoading(false);
      },
    }),
  );

  const { mutate: importTypebot } = useMutation(
    trpc.typebot.importTypebot.mutationOptions({
      onMutate: () => {
        setIsLoading(true);
      },
      onSuccess: (data) => {
        router.push({
          pathname: `/typebots/${data.typebot.id}/edit`,
        });
      },
      onSettled: () => {
        setIsLoading(false);
      },
    }),
  );

  const handleCreateSubmit = async (
    typebot?: Typebot,
    args?: { enableSafetyFlags?: boolean; fromTemplate?: string },
  ) => {
    if (!user || !workspace) return;
    const folderId = router.query.folderId?.toString() ?? null;
    if (typebot)
      importTypebot({
        workspaceId: workspace.id,
        typebot: {
          ...typebot,
          folderId,
        },
        fromTemplate: args?.fromTemplate,
        enableSafetyFlags: args?.enableSafetyFlags,
      });
    else
      createTypebot({
        workspaceId: workspace.id,
        typebot: {
          name: t("typebots.defaultName"),
          folderId,
        },
      });
  };

  return (
    <div className="flex flex-col items-center w-full pt-20 gap-10">
      <div className="flex flex-col w-full max-w-[650px] p-10 gap-10 rounded-lg border bg-gray-1">
        <h2>{t("templates.buttons.heading")}</h2>
        <div className="flex flex-col w-full gap-6">
          <Button
            variant="outline-secondary"
            className="w-full py-8 text-lg [&_svg]:size-5 [&_svg]:text-blue-10"
            onClick={() => handleCreateSubmit()}
            disabled={isLoading}
            size="lg"
          >
            <LayoutBottomIcon />
            {t("templates.buttons.fromScratchButton.label")}
          </Button>
          <Button
            variant="outline-secondary"
            className="w-full py-8 text-lg [&_svg]:size-5 [&_svg]:text-orange-10"
            onClick={onOpen}
            disabled={isLoading}
            size="lg"
          >
            <GridViewIcon />
            {t("templates.buttons.fromTemplateButton.label")}
          </Button>
          <ImportTypebotFromFileButton
            variant="outline-secondary"
            className="w-full py-8 text-lg [&_svg]:size-5 [&_svg]:text-purple-10"
            disabled={isLoading}
            onNewTypebot={handleCreateSubmit}
            size="lg"
          >
            <Download01Icon />
            {t("templates.buttons.importFileButton.label")}
          </ImportTypebotFromFileButton>
        </div>
      </div>
      <TemplatesDialog
        isOpen={isOpen}
        onClose={onClose}
        onTypebotChoose={handleCreateSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};
