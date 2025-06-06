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
import { trpc, trpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
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
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
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

  const { mutate: importTypebot } = useMutation(
    trpc.typebot.importTypebot.mutationOptions({
      onError: (error) => {
        toast({ description: error.message });
      },
      onSuccess: ({ typebot }) => {
        router.push(`/typebots/${typebot.id}/edit`);
      },
    }),
  );

  const { mutate: deleteTypebot } = useMutation(
    trpc.typebot.deleteTypebot.mutationOptions({
      onError: (error) => {
        toast({ description: error.message });
      },
      onSuccess: () => {
        onTypebotUpdated();
      },
    }),
  );

  const { mutate: unpublishTypebot } = useMutation(
    trpc.typebot.unpublishTypebot.mutationOptions({
      onError: (error) => {
        toast({ description: error.message });
      },
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
      bgColor={useColorModeValue("white", "gray.900")}
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
          <IconButton
            icon={<GripIcon />}
            pos="absolute"
            top="20px"
            left="20px"
            aria-label="Drag"
            cursor="grab"
            variant="ghost"
            colorScheme="orange"
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
