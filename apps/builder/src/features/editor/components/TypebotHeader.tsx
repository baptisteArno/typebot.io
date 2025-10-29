import { useTranslate } from "@tolgee/react";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ArrowLeft01Icon } from "@typebot.io/ui/icons/ArrowLeft01Icon";
import { Copy01Icon } from "@typebot.io/ui/icons/Copy01Icon";
import { CustomerSupportIcon } from "@typebot.io/ui/icons/CustomerSupportIcon";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { PlayIcon } from "@typebot.io/ui/icons/PlayIcon";
import { Redo03Icon } from "@typebot.io/ui/icons/Redo03Icon";
import { Undo03Icon } from "@typebot.io/ui/icons/Undo03Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ButtonLink } from "@/components/ButtonLink";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { SupportBubble } from "@/components/SupportBubble";
import { PublishButton } from "@/features/publish/components/PublishButton";
import { ShareTypebotButton } from "@/features/share/components/ShareTypebotButton";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRightPanel } from "@/hooks/useRightPanel";
import { useEditor } from "../providers/EditorProvider";
import { useTypebot } from "../providers/TypebotProvider";
import { EditableTypebotName } from "./EditableTypebotName";
import { GuestTypebotHeader } from "./UnauthenticatedTypebotHeader";

export const TypebotHeader = () => {
  const { typebot, publishedTypebot, currentUserMode } = useTypebot();
  const { workspace } = useWorkspace();
  const { isOpen, onOpen } = useOpenControls();

  const handleHelpClick = () => {
    isCloudProdInstance() && workspace?.plan && workspace.plan !== Plan.FREE
      ? onOpen()
      : window.open("https://docs.typebot.io/guides/how-to-get-help", "_blank");
  };

  if (currentUserMode === "guest") return <GuestTypebotHeader />;
  return (
    <div className="flex w-full border-b justify-center items-center relative h-(--header-height) bg-gray-1 shrink-0">
      {isOpen && <SupportBubble autoShowDelay={0} />}
      <LeftElements className="absolute left-4" onHelpClick={handleHelpClick} />
      <TypebotNav
        className="absolute hidden xl:flex"
        typebotId={typebot?.id}
        isResultsDisplayed={isDefined(publishedTypebot)}
      />
      <RightElements
        className="absolute right-10 hidden sm:flex"
        isResultsDisplayed={isDefined(publishedTypebot)}
      />
    </div>
  );
};

const LeftElements = ({
  onHelpClick,
  className,
}: {
  onHelpClick: () => void;
  className?: string;
}) => {
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
    <div className={cn("flex items-center justify-center gap-6", className)}>
      <div className="flex items-center gap-3">
        <ButtonLink
          aria-label="Navigate back"
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
          size="icon"
          variant="secondary"
          className="size-8"
        >
          <ArrowLeft01Icon />
        </ButtonLink>
        <div className="flex items-center gap-1">
          {typebot && (
            <EditableEmojiOrImageIcon
              uploadFileProps={{
                workspaceId: typebot.workspaceId,
                typebotId: typebot.id,
                fileName: "icon",
              }}
              icon={typebot?.icon}
              onChangeIcon={handleChangeIcon}
              defaultIcon={LayoutBottomIcon}
            />
          )}
          <EditableTypebotName
            key={`typebot-name-${typebot?.name ?? ""}`}
            defaultName={typebot?.name ?? ""}
            onNewName={handleNameSubmit}
          />
        </div>

        {currentUserMode === "write" && (
          <div className="flex items-center gap-2">
            <Tooltip.Root {...undoOpenControls} keepOpenOnClick>
              <Tooltip.TriggerButton
                size="icon"
                variant="secondary"
                className="size-8 hidden sm:flex"
                aria-label={t("editor.header.undoButton.label")}
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo03Icon />
              </Tooltip.TriggerButton>
              <Tooltip.Popup>
                {isUndoExecuted
                  ? t("editor.header.undo.tooltip.label")
                  : t("editor.header.undoButton.label")}
              </Tooltip.Popup>
            </Tooltip.Root>

            <Tooltip.Root {...redoOpenControls} keepOpenOnClick>
              <Tooltip.TriggerButton
                size="icon"
                variant="secondary"
                className="size-8 hidden sm:flex"
                aria-label={t("editor.header.redoButton.label")}
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo03Icon />
              </Tooltip.TriggerButton>
              <Tooltip.Popup>
                {isRedoExecuted
                  ? t("editor.header.undo.tooltip.label")
                  : t("editor.header.redoButton.label")}
              </Tooltip.Popup>
            </Tooltip.Root>
          </div>
        )}
        <Button onClick={onHelpClick} variant="secondary" size="sm">
          <CustomerSupportIcon />
          <span className="hidden xl:inline">
            {t("editor.header.helpButton.label")}
          </span>
        </Button>
      </div>
      {isSavingLoading && (
        <div className="flex items-center gap-2">
          <LoaderCircleIcon className="animate-spin" />
          <p className="text-sm" color="gray.400">
            {t("editor.header.savingSpinner.label")}
          </p>
        </div>
      )}
    </div>
  );
};

const RightElements = ({
  isResultsDisplayed,
  className,
}: {
  isResultsDisplayed: boolean;
  className?: string;
}) => {
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
    <div className={cn("flex items-center gap-2", className)}>
      <TypebotNav
        className="hidden md:flex xl:hidden"
        typebotId={typebot?.id}
        isResultsDisplayed={isResultsDisplayed}
      />
      <div className="flex relative">
        <ShareTypebotButton isLoading={isNotDefined(typebot)} />
      </div>
      {router.pathname.includes("/edit") && rightPanel !== "preview" && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePreviewClick}
          disabled={isNotDefined(typebot) || isSavingLoading}
        >
          <PlayIcon />
          <span className="hidden xl:inline">
            {t("editor.header.previewButton.label")}
          </span>
        </Button>
      )}
      {currentUserMode === "guest" && (
        <ButtonLink
          href={`/typebots/${typebot?.id}/duplicate`}
          disabled={isNotDefined(typebot)}
          variant="secondary"
          size="sm"
        >
          <Copy01Icon />
          Duplicate
        </ButtonLink>
      )}
      {currentUserMode === "write" && <PublishButton size="sm" />}
    </div>
  );
};

const TypebotNav = ({
  typebotId,
  isResultsDisplayed,
  className,
}: {
  typebotId?: string;
  isResultsDisplayed: boolean;
  className?: string;
}) => {
  const { t } = useTranslate();
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ButtonLink
        href={`/typebots/${typebotId}/edit`}
        variant={router.pathname.includes("/edit") ? "outline" : "ghost"}
        size="sm"
      >
        {t("editor.header.flowButton.label")}
      </ButtonLink>
      <ButtonLink
        href={`/typebots/${typebotId}/theme`}
        variant={router.pathname.endsWith("theme") ? "outline" : "ghost"}
        size="sm"
      >
        {t("editor.header.themeButton.label")}
      </ButtonLink>
      <ButtonLink
        href={`/typebots/${typebotId}/settings`}
        variant={router.pathname.endsWith("settings") ? "outline" : "ghost"}
        size="sm"
      >
        {t("editor.header.settingsButton.label")}
      </ButtonLink>
      <ButtonLink
        href={`/typebots/${typebotId}/share`}
        variant={router.pathname.endsWith("share") ? "outline" : "ghost"}
        size="sm"
      >
        {t("share.button.label")}
      </ButtonLink>
      {isResultsDisplayed && (
        <ButtonLink
          href={`/typebots/${typebotId}/results`}
          variant={router.pathname.includes("results") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.resultsButton.label")}
        </ButtonLink>
      )}
    </div>
  );
};
