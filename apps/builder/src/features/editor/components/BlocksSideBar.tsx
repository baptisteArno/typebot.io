import { useTranslate } from "@tolgee/react";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { env } from "@typebot.io/env";
import { EventType } from "@typebot.io/events/constants";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { isDefined } from "@typebot.io/lib/utils";
import { Input } from "@typebot.io/ui/components/Input";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { SquareLock01Icon } from "@typebot.io/ui/icons/SquareLock01Icon";
import { SquareUnlock01Icon } from "@typebot.io/ui/icons/SquareUnlock01Icon";
import { cx } from "@typebot.io/ui/lib/cva";
import type React from "react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Portal } from "@/components/Portal";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";
import { useEventListener } from "@/hooks/useEventListener";
import { EventCard } from "../../events/components/EventCard";
import { EventCardOverlay } from "../../events/components/EventCardOverlay";
import { getEventBlockLabel } from "../../events/components/EventLabel";
import { leftSidebarLockedStorageKey } from "../constants";
import { BlockCard } from "./BlockCard";
import { BlockCardOverlay } from "./BlockCardOverlay";
import {
  getBubbleBlockLabel,
  getInputBlockLabel,
  getIntegrationBlockLabel,
  getLogicBlockLabel,
} from "./BlockLabel";

// Integration blocks migrated to forged blocks
const legacyIntegrationBlocks = [IntegrationBlockType.OPEN_AI];

export const BlocksSideBar = () => {
  const { t } = useTranslate();
  const {
    setDraggedBlockType,
    draggedBlockType,
    draggedEventType,
    setDraggedEventType,
  } = useBlockDnd();
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [relativeCoordinates, setRelativeCoordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isLocked, setIsLocked] = useState(
    localStorage.getItem(leftSidebarLockedStorageKey) !== "false",
  );
  const [isExtended, setIsExtended] = useState(
    localStorage.getItem(leftSidebarLockedStorageKey) !== "false",
  );
  const [searchInput, setSearchInput] = useState("");

  const closeSideBar = useDebouncedCallback(() => setIsExtended(false), 200);

  const handleMouseMove = (event: MouseEvent) => {
    if (!draggedBlockType && !draggedEventType) return;
    const { clientX, clientY } = event;
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    });
  };
  useEventListener("mousemove", handleMouseMove);

  const initBlockDragging = (e: React.MouseEvent, type: BlockV6["type"]) => {
    const element = e.currentTarget as HTMLDivElement;
    const rect = element.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRelativeCoordinates({ x, y });
    setDraggedBlockType(type);
  };

  const initEventDragging = (
    e: React.MouseEvent,
    type: TDraggableEvent["type"],
  ) => {
    const element = e.currentTarget as HTMLDivElement;
    const rect = element.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRelativeCoordinates({ x, y });
    setDraggedEventType(type);
  };

  const handleMouseUp = () => {
    if (!draggedBlockType && !draggedEventType) return;
    setDraggedBlockType(undefined);
    setDraggedEventType(undefined);
    setPosition({
      x: 0,
      y: 0,
    });
  };
  useEventListener("mouseup", handleMouseUp);

  const handleLockClick = () => {
    try {
      localStorage.setItem(leftSidebarLockedStorageKey, String(!isLocked));
    } catch (error) {
      console.error(error);
    }
    setIsLocked(!isLocked);
  };

  const handleDockBarEnter = () => {
    closeSideBar.flush();
    setIsExtended(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isLocked || e.clientX < 100) return;
    closeSideBar();
  };

  const handleSearchInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchInput(event.target.value);
  };

  const filteredForgedBlockIds = Object.values(forgedBlocks)
    .filter((block) => {
      return (
        block.id.toLowerCase().includes(searchInput.toLowerCase()) ||
        (block.tags &&
          block.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchInput.toLowerCase()),
          )) ||
        block.name.toLowerCase().includes(searchInput.toLowerCase())
      );
    })
    .map((block) => block.id);

  const filteredBubbleBlockTypes = Object.values(BubbleBlockType).filter(
    (type) =>
      getBubbleBlockLabel(t)
        [type].toLowerCase()
        .includes(searchInput.toLowerCase()),
  );

  const filteredInputBlockTypes = Object.values(InputBlockType).filter(
    (type) => {
      return getInputBlockLabel(t)
        [type].toLowerCase()
        .includes(searchInput.toLowerCase());
    },
  );

  const filteredLogicBlockTypes = Object.values(LogicBlockType).filter(
    (type) =>
      type === LogicBlockType.WEBHOOK
        ? isDefined(env.NEXT_PUBLIC_PARTYKIT_HOST)
        : true &&
          getLogicBlockLabel(t)
            [type].toLowerCase()
            .includes(searchInput.toLowerCase()),
  );

  const filteredEventBlockTypes = Object.values(EventType).filter((type) =>
    getEventBlockLabel(t)
      [type].toLowerCase()
      .includes(searchInput.toLowerCase()),
  );

  const filteredIntegrationBlockTypes = Object.values(
    IntegrationBlockType,
  ).filter(
    (type) =>
      getIntegrationBlockLabel(t)
        [type].toLowerCase()
        .includes(searchInput.toLowerCase()) &&
      !legacyIntegrationBlocks.includes(type),
  );

  return (
    <div
      className={cx(
        "flex w-[360px] absolute pl-4 py-4 left-0 transition-transform duration-150 ease-out h-[calc(100vh-var(--header-height))]",
        isExtended ? "translate-x-0" : "translate-x-[-350px]",
      )}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col w-full rounded-lg border pt-4 pb-10 px-4 gap-6 overflow-y-auto bg-gray-1 select-none">
        <div className="flex justify-between w-full items-center gap-3">
          <Input
            placeholder="Search"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <Tooltip.Root>
            <Tooltip.TriggerButton
              aria-label={
                isLocked
                  ? t("editor.sidebarBlocks.sidebar.icon.unlock.label")
                  : t("editor.sidebarBlocks.sidebar.icon.lock.label")
              }
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={handleLockClick}
            >
              {isLocked ? <SquareLock01Icon /> : <SquareUnlock01Icon />}
            </Tooltip.TriggerButton>
            <Tooltip.Popup>
              {isLocked
                ? t("editor.sidebarBlocks.sidebar.unlock.label")
                : t("editor.sidebarBlocks.sidebar.lock.label")}
            </Tooltip.Popup>
          </Tooltip.Root>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm">
            {t("editor.sidebarBlocks.blockType.bubbles.heading")}
          </h4>
          <div className="grid gap-3 grid-cols-2">
            {filteredBubbleBlockTypes.map((type) => (
              <BlockCard
                key={type}
                type={type}
                onMouseDown={initBlockDragging}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm">
            {t("editor.sidebarBlocks.blockType.inputs.heading")}
          </h4>
          <div className="grid gap-3 grid-cols-2">
            {filteredInputBlockTypes.map((type) => (
              <BlockCard
                key={type}
                type={type}
                onMouseDown={initBlockDragging}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm">
            {t("editor.sidebarBlocks.blockType.logic.heading")}
          </h4>
          <div className="grid gap-3 grid-cols-2">
            {filteredLogicBlockTypes.map((type) => (
              <BlockCard
                key={type}
                type={type}
                onMouseDown={initBlockDragging}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm">
            {t("editor.sidebarBlocks.blockType.events.heading")}
          </h4>
          <div className="grid gap-3 grid-cols-2">
            {filteredEventBlockTypes.map((type) => (
              <EventCard
                key={type}
                type={type}
                onMouseDown={initEventDragging}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm">
            {t("editor.sidebarBlocks.blockType.integrations.heading")}
          </h4>
          <div className="grid gap-3 grid-cols-2">
            {filteredIntegrationBlockTypes
              .concat(filteredForgedBlockIds as any)
              .map((type) => (
                <BlockCard
                  key={type}
                  type={type}
                  onMouseDown={initBlockDragging}
                />
              ))}
          </div>
        </div>

        {draggedBlockType && (
          <Portal>
            <BlockCardOverlay
              type={draggedBlockType}
              onMouseUp={handleMouseUp}
              className="fixed top-0 left-0"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
              }}
            />
          </Portal>
        )}
        {draggedEventType && (
          <Portal>
            <EventCardOverlay
              type={draggedEventType}
              onMouseUp={handleMouseUp}
              className="fixed top-0 left-0"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
              }}
            />
          </Portal>
        )}
      </div>
      {!isLocked && (
        <div
          className="flex animate-in fade-in-0 absolute h-full w-[450px] justify-end pr-10 items-center -right-[70px] top-0 -z-10"
          onMouseEnter={handleDockBarEnter}
        >
          <div className="flex w-[5px] h-[20px] rounded-md bg-gray-7" />
        </div>
      )}
    </div>
  );
};
