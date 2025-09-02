import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { GripIcon, MoreVerticalIcon } from "@/components/icons";
import type { TypebotInDashboard } from "@/features/dashboard/types";
import {
  type NodePosition,
  useDragDistance,
} from "@/features/graph/providers/GraphDndProvider";
import { duplicateName } from "@/features/typebot/helpers/duplicateName";
import { isMobile } from "@/helpers/isMobile";
import { useOpenControls } from "@/hooks/useOpenControls";
import { trpc, trpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { Alert, AlertIcon, Tag, Text, VStack } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { T, useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { buttonVariants } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/router";
import React, { memo } from "react";
import { useDebounce } from "use-debounce";

type Props = {
  typebot: TypebotInDashboard;
  isReadOnly?: boolean;
  draggedTypebot: TypebotInDashboard | undefined;
  onTypebotUpdated: () => void;
  onDrag: (position: NodePosition) => void;
};

const TypebotButton = ({
  typebot,
  isReadOnly = false,
  draggedTypebot,
  onTypebotUpdated,
  onDrag,
}: Props) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [draggedTypebotDebounced] = useDebounce(draggedTypebot, 200);
  const deleteDialogControls = useOpenControls();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useDragDistance({
    ref: buttonRef,
    onDrag,
    deps: [],
  });

  const { mutate: importTypebot } = useMutation(
    trpc.typebot.importTypebot.mutationOptions({
      onSuccess: ({ typebot }) => {
        router.push(`/typebots/${typebot.id}/edit`);
      },
    }),
  );

  const { mutate: deleteTypebot } = useMutation(
    trpc.typebot.deleteTypebot.mutationOptions({
      onSuccess: () => {
        onTypebotUpdated();
      },
    }),
  );

  const { mutate: unpublishTypebot } = useMutation(
    trpc.typebot.unpublishTypebot.mutationOptions({
      onSuccess: () => {
        onTypebotUpdated();
      },
    }),
  );

  const handleTypebotClick = () => {
    if (draggedTypebotDebounced) return;
    router.push(
      isMobile
        ? `/typebots/${typebot.id}/results`
        : `/typebots/${typebot.id}/edit`,
    );
  };

  const handleDeleteTypebotClick = async () => {
    if (isReadOnly) return;
    deleteTypebot({
      typebotId: typebot.id,
    });
  };

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { typebot: typebotToDuplicate } =
      await trpcClient.typebot.getTypebot.query({
        typebotId: typebot.id,
      });
    if (!typebotToDuplicate) return;
    importTypebot({
      workspaceId: typebotToDuplicate.workspaceId,
      typebot: {
        ...typebotToDuplicate,
        name: duplicateName(typebotToDuplicate.name),
      },
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDialogControls.onOpen();
  };

  const handleUnpublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!typebot.publishedTypebotId) return;
    unpublishTypebot({ typebotId: typebot.id });
  };

  return (
    <>
      <div
        role="button"
        onClick={handleTypebotClick}
        className={cn(
          buttonVariants({
            variant: "outline-secondary",
            iconStyle: "none",
            size: "lg",
          }),
          "flex-col w-[225px] h-[270px] rounded-lg whitespace-normal bg-gray-1 relative",
          draggedTypebot && "opacity-30",
        )}
      >
        {typebot.publishedTypebotId && (
          <Tag
            colorScheme="orange"
            variant="solid"
            rounded="full"
            pos="absolute"
            top="27px"
            size="sm"
          >
            {t("folders.typebotButton.live")}
          </Tag>
        )}
        {!isReadOnly && (
          <>
            <Button
              ref={buttonRef}
              className="absolute top-5 left-5 size-8 cursor-grab"
              aria-label="Drag"
              variant="ghost"
              size="icon"
            >
              <GripIcon />
            </Button>
            <Menu.Root>
              <Menu.TriggerButton
                aria-label={t("folders.typebotButton.showMoreOptions")}
                data-testid="more-button"
                onClick={(e) => e.stopPropagation()}
                variant="outline-secondary"
                size="icon"
                className="absolute top-5 right-5 size-8"
              >
                <MoreVerticalIcon />
              </Menu.TriggerButton>
              <Menu.Popup align="end">
                {typebot.publishedTypebotId && (
                  <Menu.Item onClick={handleUnpublishClick}>
                    {t("folders.typebotButton.unpublish")}
                  </Menu.Item>
                )}
                <Menu.Item onClick={handleDuplicateClick}>
                  {t("folders.typebotButton.duplicate")}
                </Menu.Item>
                <Menu.Item className="text-red-10" onClick={handleDeleteClick}>
                  {t("delete")}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </>
        )}
        <VStack spacing="4">
          <EmojiOrImageIcon
            icon={typebot.icon}
            size="lg"
            defaultIcon={LayoutBottomIcon}
          />
          <Text textAlign="center" noOfLines={4} maxW="180px">
            {typebot.name}
          </Text>
        </VStack>
      </div>
      {!isReadOnly && (
        <ConfirmDialog
          confirmButtonLabel={t("delete")}
          onConfirm={handleDeleteTypebotClick}
          isOpen={deleteDialogControls.isOpen}
          onClose={deleteDialogControls.onClose}
        >
          <Text>
            <T
              keyName="folders.typebotButton.deleteConfirmationMessage"
              params={{
                strong: <strong>{typebot.name}</strong>,
              }}
            />
          </Text>
          <Alert status="warning">
            <AlertIcon />
            {t("folders.typebotButton.deleteConfirmationMessageWarning")}
          </Alert>
        </ConfirmDialog>
      )}
    </>
  );
};

export default memo(
  TypebotButton,
  (prev, next) =>
    prev.draggedTypebot?.id === next.draggedTypebot?.id &&
    prev.typebot.id === next.typebot.id &&
    prev.isReadOnly === next.isReadOnly &&
    prev.typebot.name === next.typebot.name &&
    prev.typebot.icon === next.typebot.icon &&
    prev.typebot.publishedTypebotId === next.typebot.publishedTypebotId,
);
