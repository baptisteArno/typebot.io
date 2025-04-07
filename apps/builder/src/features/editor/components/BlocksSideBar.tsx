import { LockedIcon, UnlockedIcon } from "@/components/icons";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";
import {
  Fade,
  Flex,
  Heading,
  IconButton,
  Input,
  Portal,
  SimpleGrid,
  Stack,
  Tooltip,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
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
import type React from "react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { EventCard } from "../../events/components/EventCard";
import { EventCardOverlay } from "../../events/components/EventCardOverlay";
import { getEventBlockLabel } from "../../events/components/EventLabel";
import { headerHeight, leftSidebarLockedStorageKey } from "../constants";
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
    <Flex
      w="360px"
      pos="absolute"
      left="0"
      h={`calc(100vh - ${headerHeight}px)`}
      pl="4"
      py="4"
      onMouseLeave={handleMouseLeave}
      transform={isExtended ? "translateX(0)" : "translateX(-350px)"}
      transition="transform 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
    >
      <Stack
        w="full"
        rounded="lg"
        borderWidth="1px"
        pt="4"
        pb="10"
        px="4"
        bgColor={useColorModeValue("white", "gray.950")}
        spacing={6}
        userSelect="none"
        overflowY="auto"
      >
        <Flex
          justifyContent="space-between"
          w="full"
          alignItems="center"
          gap="3"
        >
          <Input
            placeholder="Search"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <Tooltip
            label={
              isLocked
                ? t("editor.sidebarBlocks.sidebar.unlock.label")
                : t("editor.sidebarBlocks.sidebar.lock.label")
            }
          >
            <IconButton
              icon={isLocked ? <LockedIcon /> : <UnlockedIcon />}
              aria-label={
                isLocked
                  ? t("editor.sidebarBlocks.sidebar.icon.unlock.label")
                  : t("editor.sidebarBlocks.sidebar.icon.lock.label")
              }
              size="sm"
              onClick={handleLockClick}
            />
          </Tooltip>
        </Flex>

        <Stack>
          <Heading as="h4" fontSize="sm">
            {t("editor.sidebarBlocks.blockType.bubbles.heading")}
          </Heading>
          <SimpleGrid columns={2} spacing="3">
            {filteredBubbleBlockTypes.map((type) => (
              <BlockCard
                key={type}
                type={type}
                onMouseDown={initBlockDragging}
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Heading fontSize="sm">
            {t("editor.sidebarBlocks.blockType.inputs.heading")}
          </Heading>
          <SimpleGrid columns={2} spacing="3">
            {filteredInputBlockTypes.map((type) => (
              <BlockCard
                key={type}
                type={type}
                onMouseDown={initBlockDragging}
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Heading fontSize="sm">
            {t("editor.sidebarBlocks.blockType.logic.heading")}
          </Heading>
          <SimpleGrid columns={2} spacing="3">
            {filteredLogicBlockTypes.map((type) => (
              <BlockCard
                key={type}
                type={type}
                onMouseDown={initBlockDragging}
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Heading fontSize="sm">
            {t("editor.sidebarBlocks.blockType.events.heading")}
          </Heading>
          <SimpleGrid columns={2} spacing="3">
            {filteredEventBlockTypes.map((type) => (
              <EventCard
                key={type}
                type={type}
                onMouseDown={initEventDragging}
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Heading fontSize="sm">
            {t("editor.sidebarBlocks.blockType.integrations.heading")}
          </Heading>
          <SimpleGrid columns={2} spacing="3">
            {filteredIntegrationBlockTypes
              .concat(filteredForgedBlockIds as any)
              .map((type) => (
                <BlockCard
                  key={type}
                  type={type}
                  onMouseDown={initBlockDragging}
                />
              ))}
          </SimpleGrid>
        </Stack>

        {draggedBlockType && (
          <Portal>
            <BlockCardOverlay
              type={draggedBlockType}
              onMouseUp={handleMouseUp}
              pos="fixed"
              top="0"
              left="0"
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
              pos="fixed"
              top="0"
              left="0"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
              }}
            />
          </Portal>
        )}
      </Stack>
      <Fade in={!isLocked} unmountOnExit>
        <Flex
          pos="absolute"
          h="100%"
          right="-70px"
          w="450px"
          top="0"
          justify="flex-end"
          pr="10"
          align="center"
          onMouseEnter={handleDockBarEnter}
          zIndex={-1}
        >
          <Flex w="5px" h="20px" bgColor="gray.400" rounded="md" />
        </Flex>
      </Fade>
    </Flex>
  );
};
