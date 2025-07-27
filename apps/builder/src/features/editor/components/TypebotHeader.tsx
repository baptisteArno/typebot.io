import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { SupportBubble } from "@/components/SupportBubble";
import {
  BuoyIcon,
  ChevronLeftIcon,
  CopyIcon,
  PlayIcon,
  RedoIcon,
  ToolIcon,
  UndoIcon,
} from "@/components/icons";
import { PublishButton } from "@/features/publish/components/PublishButton";
import { ShareTypebotButton } from "@/features/share/components/ShareTypebotButton";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOpenControls } from "@/hooks/useOpenControls";
import { useRightPanel } from "@/hooks/useRightPanel";
import {
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
  type StackProps,
  Text,
  chakra,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { headerHeight } from "../constants";
import { useEditor } from "../providers/EditorProvider";
import { useTypebot } from "../providers/TypebotProvider";
import { EditableTypebotName } from "./EditableTypebotName";
import { GuestTypebotHeader } from "./UnauthenticatedTypebotHeader";

export const TypebotHeader = () => {
  const { typebot, publishedTypebot, currentUserMode } = useTypebot();
  const { workspace } = useWorkspace();
  const { isOpen, onOpen } = useDisclosure();
  const headerBgColor = useColorModeValue("white", "gray.950");

  const handleHelpClick = () => {
    isCloudProdInstance() && workspace?.plan && workspace.plan !== Plan.FREE
      ? onOpen()
      : window.open("https://docs.typebot.io/guides/how-to-get-help", "_blank");
  };

  if (currentUserMode === "guest") return <GuestTypebotHeader />;
  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      h={`${headerHeight}px`}
      pos="relative"
      bgColor={headerBgColor}
      flexShrink={0}
    >
      {isOpen && <SupportBubble autoShowDelay={0} />}
      <LeftElements pos="absolute" left="1rem" onHelpClick={handleHelpClick} />
      <TypebotNav
        display={{ base: "none", xl: "flex" }}
        pos={{ base: "absolute" }}
        typebotId={typebot?.id}
        isResultsDisplayed={isDefined(publishedTypebot)}
      />
      <RightElements
        right="40px"
        pos="absolute"
        display={["none", "flex"]}
        isResultsDisplayed={isDefined(publishedTypebot)}
      />
    </Flex>
  );
};

const LeftElements = ({
  onHelpClick,
  ...props
}: StackProps & { onHelpClick: () => void }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const {
    typebot,
    updateTypebot,
    canUndo,
    canRedo,
    undo,
    redo,
    currentUserMode,
    isSavingLoading,
  } = useTypebot();

  const [isUndoExecuted, setIsUndoExecuted] = useState(false);
  const [isRedoExecuted, setIsRedoExecuted] = useState(false);
  const undoOpenControls = useOpenControls({
    onClose: () => {
      setTimeout(() => {
        setIsUndoExecuted(false);
      }, 150);
    },
  });
  const redoOpenControls = useOpenControls({
    onClose: () => {
      setTimeout(() => {
        setIsRedoExecuted(false);
      }, 150);
    },
  });

  const handleNameSubmit = (name: string) =>
    updateTypebot({ updates: { name } });

  const handleChangeIcon = (icon: string) =>
    updateTypebot({ updates: { icon } });

  const handleUndoClick = () => {
    if (!canUndo) return;
    setIsUndoExecuted(true);
    undo();
  };

  const handleRedoClick = () => {
    if (!canRedo) return;
    setIsRedoExecuted(true);
    redo();
  };

  const debouncedCloseUndoTooltip = useDebouncedCallback(() => {
    undoOpenControls.onClose();
  }, 1000);
  const debouncedCloseRedoTooltip = useDebouncedCallback(() => {
    redoOpenControls.onClose();
  }, 1000);

  useKeyboardShortcuts({
    undo: () => {
      if (!canUndo) return;
      undoOpenControls.onOpen();
      handleUndoClick();
      debouncedCloseUndoTooltip();
    },
    redo: () => {
      if (!canRedo) return;
      redoOpenControls.onOpen();
      handleRedoClick();
      debouncedCloseRedoTooltip();
    },
  });

  return (
    <HStack justify="center" align="center" spacing="6" {...props}>
      <HStack alignItems="center" spacing={3}>
        <IconButton
          as={Link}
          aria-label="Navigate back"
          icon={<ChevronLeftIcon fontSize="md" />}
          href={{
            pathname: router.query.parentId
              ? "/typebots/[typebotId]/edit"
              : typebot?.folderId
                ? "/typebots/folders/[id]"
                : "/typebots",
            query: {
              id: typebot?.folderId ?? [],
              parentId: Array.isArray(router.query.parentId)
                ? router.query.parentId.slice(0, -1)
                : [],
              typebotId: Array.isArray(router.query.parentId)
                ? [...router.query.parentId].pop()
                : (router.query.parentId ?? []),
            },
          }}
          size="sm"
        />
        <HStack spacing={1}>
          {typebot && (
            <EditableEmojiOrImageIcon
              uploadFileProps={{
                workspaceId: typebot.workspaceId,
                typebotId: typebot.id,
                fileName: "icon",
              }}
              icon={typebot?.icon}
              onChangeIcon={handleChangeIcon}
              defaultIcon={ToolIcon}
            />
          )}
          (
          <EditableTypebotName
            key={`typebot-name-${typebot?.name ?? ""}`}
            defaultName={typebot?.name ?? ""}
            onNewName={handleNameSubmit}
          />
          )
        </HStack>

        {currentUserMode === "write" && (
          <HStack>
            <Tooltip.Root {...undoOpenControls} keepOpenOnClick>
              <Tooltip.Trigger
                render={
                  <IconButton
                    display={["none", "flex"]}
                    icon={<UndoIcon fontSize="16px" />}
                    size="sm"
                    aria-label={t("editor.header.undoButton.label")}
                    onClick={handleUndoClick}
                    isDisabled={!canUndo}
                  />
                }
              />
              <Tooltip.Popup>
                {isUndoExecuted
                  ? t("editor.header.undo.tooltip.label")
                  : t("editor.header.undoButton.label")}
              </Tooltip.Popup>
            </Tooltip.Root>

            <Tooltip.Root {...redoOpenControls} keepOpenOnClick>
              <Tooltip.Trigger
                render={
                  <IconButton
                    display={["none", "flex"]}
                    icon={<RedoIcon fontSize="16px" />}
                    size="sm"
                    aria-label={t("editor.header.redoButton.label")}
                    onClick={handleRedoClick}
                    isDisabled={!canRedo}
                  />
                }
              />
              <Tooltip.Popup>
                {isRedoExecuted
                  ? t("editor.header.undo.tooltip.label")
                  : t("editor.header.redoButton.label")}
              </Tooltip.Popup>
            </Tooltip.Root>
          </HStack>
        )}
        <Button
          leftIcon={<BuoyIcon />}
          onClick={onHelpClick}
          size="sm"
          iconSpacing={{ base: 0, xl: 2 }}
        >
          <chakra.span display={{ base: "none", xl: "inline" }}>
            {t("editor.header.helpButton.label")}
          </chakra.span>
        </Button>
      </HStack>
      {isSavingLoading && (
        <HStack>
          <Spinner speed="0.7s" size="sm" color="gray.400" />
          <Text fontSize="sm" color="gray.400">
            {t("editor.header.savingSpinner.label")}
          </Text>
        </HStack>
      )}
    </HStack>
  );
};

const RightElements = ({
  isResultsDisplayed,
  ...props
}: StackProps & { isResultsDisplayed: boolean }) => {
  const router = useRouter();
  const { t } = useTranslate();
  const { typebot, currentUserMode, save, isSavingLoading } = useTypebot();
  const { setStartPreviewFrom } = useEditor();
  const [rightPanel, setRightPanel] = useRightPanel();

  const handlePreviewClick = async () => {
    setStartPreviewFrom(undefined);
    await save();
    setRightPanel("preview");
  };

  return (
    <HStack {...props}>
      <TypebotNav
        display={{ base: "none", md: "flex", xl: "none" }}
        typebotId={typebot?.id}
        isResultsDisplayed={isResultsDisplayed}
      />
      <Flex pos="relative">
        <ShareTypebotButton isLoading={isNotDefined(typebot)} />
      </Flex>
      {router.pathname.includes("/edit") && rightPanel !== "preview" && (
        <Button
          colorScheme="gray"
          onClick={handlePreviewClick}
          isLoading={isNotDefined(typebot) || isSavingLoading}
          leftIcon={<PlayIcon />}
          size="sm"
          iconSpacing={{ base: 0, xl: 2 }}
        >
          <chakra.span display={{ base: "none", xl: "inline" }}>
            {t("editor.header.previewButton.label")}
          </chakra.span>
        </Button>
      )}
      {currentUserMode === "guest" && (
        <Button
          as={Link}
          href={`/typebots/${typebot?.id}/duplicate`}
          leftIcon={<CopyIcon />}
          isLoading={isNotDefined(typebot)}
          size="sm"
        >
          Duplicate
        </Button>
      )}
      {currentUserMode === "write" && <PublishButton size="sm" />}
    </HStack>
  );
};

const TypebotNav = ({
  typebotId,
  isResultsDisplayed,
  ...stackProps
}: {
  typebotId?: string;
  isResultsDisplayed: boolean;
} & StackProps) => {
  const { t } = useTranslate();
  const router = useRouter();

  return (
    <HStack {...stackProps}>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/edit`}
        colorScheme={router.pathname.includes("/edit") ? "orange" : "gray"}
        variant={router.pathname.includes("/edit") ? "outline" : "ghost"}
        size="sm"
      >
        {t("editor.header.flowButton.label")}
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/theme`}
        colorScheme={router.pathname.endsWith("theme") ? "orange" : "gray"}
        variant={router.pathname.endsWith("theme") ? "outline" : "ghost"}
        size="sm"
      >
        {t("editor.header.themeButton.label")}
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/settings`}
        colorScheme={router.pathname.endsWith("settings") ? "orange" : "gray"}
        variant={router.pathname.endsWith("settings") ? "outline" : "ghost"}
        size="sm"
      >
        {t("editor.header.settingsButton.label")}
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/translations`}
        colorScheme={
          router.pathname.endsWith("translations") ? "orange" : "gray"
        }
        variant={router.pathname.endsWith("translations") ? "outline" : "ghost"}
        size="sm"
      >
        Translations
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/share`}
        colorScheme={router.pathname.endsWith("share") ? "orange" : "gray"}
        variant={router.pathname.endsWith("share") ? "outline" : "ghost"}
        size="sm"
      >
        {t("share.button.label")}
      </Button>
      {isResultsDisplayed && (
        <Button
          as={Link}
          href={`/typebots/${typebotId}/results`}
          colorScheme={router.pathname.includes("results") ? "orange" : "gray"}
          variant={router.pathname.includes("results") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.resultsButton.label")}
        </Button>
      )}
    </HStack>
  );
};
