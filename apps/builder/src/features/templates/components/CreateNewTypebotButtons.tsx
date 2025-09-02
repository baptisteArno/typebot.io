import { DownloadIcon, TemplateIcon } from "@/components/icons";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Heading,
  Stack,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ImportTypebotFromFileButton } from "./ImportTypebotFromFileButton";
import { TemplatesDialog } from "./TemplatesDialog";

export const CreateNewTypebotButtons = () => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { user } = useUser();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    fromTemplate?: string,
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
        fromTemplate,
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
    <VStack w="full" pt="20" spacing={10}>
      <Stack
        w="full"
        maxW="650px"
        p="10"
        gap={10}
        rounded="lg"
        borderWidth={1}
        bgColor={useColorModeValue("white", "gray.900")}
      >
        <Heading>{t("templates.buttons.heading")}</Heading>
        <Stack w="full" spacing={6}>
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
            <TemplateIcon />
            {t("templates.buttons.fromTemplateButton.label")}
          </Button>
          <ImportTypebotFromFileButton
            variant="outline-secondary"
            className="w-full py-8 text-lg [&_svg]:size-5 [&_svg]:text-purple-10"
            disabled={isLoading}
            onNewTypebot={handleCreateSubmit}
            size="lg"
          >
            <DownloadIcon />
            {t("templates.buttons.importFileButton.label")}
          </ImportTypebotFromFileButton>
        </Stack>
      </Stack>

      <TemplatesDialog
        isOpen={isOpen}
        onClose={onClose}
        onTypebotChoose={handleCreateSubmit}
        isLoading={isLoading}
      />
    </VStack>
  );
};
