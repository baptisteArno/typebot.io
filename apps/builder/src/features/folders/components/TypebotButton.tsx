import { ConfirmModal } from "@/components/ConfirmModal";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { GripIcon } from "@/components/icons";
import type { TypebotInDashboard } from "@/features/dashboard/types";
import {
  type NodePosition,
  useDragDistance,
} from "@/features/graph/providers/GraphDndProvider";
import { duplicateName } from "@/features/typebot/helpers/duplicateName";
import { isMobile } from "@/helpers/isMobile";
import { useToast } from "@/hooks/useToast";
import { trpc, trpcVanilla } from "@/lib/trpc";
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  IconButton,
  MenuItem,
  Stack,
  Tag,
  Text,
  VStack,
  WrapItem,
  useDisclosure,
} from "@chakra-ui/react";
import { T, useTranslate } from "@tolgee/react";
import { useRouter } from "next/router";
import React, { memo } from "react";
import { useDebounce } from "use-debounce";
import { MoreButton } from "./MoreButton";

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
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const buttonRef = React.useRef<HTMLDivElement>(null);

  useDragDistance({
    ref: buttonRef,
    onDrag,
    deps: [],
  });

  const { showToast } = useToast();

  const { mutate: importTypebot } = trpc.typebot.importTypebot.useMutation({
    onError: (error) => {
      showToast({ description: error.message });
    },
    onSuccess: ({ typebot }) => {
      router.push(`/typebots/${typebot.id}/edit`);
    },
  });

  const { mutate: deleteTypebot } = trpc.typebot.deleteTypebot.useMutation({
    onError: (error) => {
      showToast({ description: error.message });
    },
    onSuccess: () => {
      onTypebotUpdated();
    },
  });

  const { mutate: unpublishTypebot } =
    trpc.typebot.unpublishTypebot.useMutation({
      onError: (error) => {
        showToast({ description: error.message });
      },
      onSuccess: () => {
        onTypebotUpdated();
      },
    });

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
      await trpcVanilla.typebot.getTypebot.query({
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
    onDeleteOpen();
  };

  const handleUnpublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!typebot.publishedTypebotId) return;
    unpublishTypebot({ typebotId: typebot.id });
  };

  return (
    <Button
      ref={buttonRef}
      as={WrapItem}
      onClick={handleTypebotClick}
      display="flex"
      flexDir="column"
      variant="outline"
      w="225px"
      h="270px"
      rounded="lg"
      whiteSpace="normal"
      opacity={draggedTypebot ? 0.3 : 1}
      cursor="pointer"
    >
      {typebot.publishedTypebotId && (
        <Tag
          colorScheme="blue"
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
          <IconButton
            icon={<GripIcon />}
            pos="absolute"
            top="20px"
            left="20px"
            aria-label="Drag"
            cursor="grab"
            variant="ghost"
            colorScheme="blue"
            size="sm"
          />
          <MoreButton
            pos="absolute"
            top="20px"
            right="20px"
            aria-label={t("folders.typebotButton.showMoreOptions")}
          >
            {typebot.publishedTypebotId && (
              <MenuItem onClick={handleUnpublishClick}>
                {t("folders.typebotButton.unpublish")}
              </MenuItem>
            )}
            <MenuItem onClick={handleDuplicateClick}>
              {t("folders.typebotButton.duplicate")}
            </MenuItem>
            <MenuItem color="red.400" onClick={handleDeleteClick}>
              {t("folders.typebotButton.delete")}
            </MenuItem>
          </MoreButton>
        </>
      )}
      <VStack spacing="4">
        <Flex
          rounded="full"
          justifyContent="center"
          alignItems="center"
          fontSize={"4xl"}
        >
          {<EmojiOrImageIcon icon={typebot.icon} boxSize={"35px"} />}
        </Flex>
        <Text textAlign="center" noOfLines={4} maxW="180px">
          {typebot.name}
        </Text>
      </VStack>
      {!isReadOnly && (
        <ConfirmModal
          message={
            <Stack spacing="4">
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
            </Stack>
          }
          confirmButtonLabel={t("delete")}
          onConfirm={handleDeleteTypebotClick}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}
    </Button>
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
