import { Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import type { TDraggableEvent, TEvent } from "@typebot.io/events/schemas";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useEffect, useState } from "react";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";

type Props = {
  type: TEvent["type"];
  tooltip?: string;
  isDisabled?: boolean;
  children: React.ReactNode;
  onMouseDown: (e: React.MouseEvent, type: TDraggableEvent["type"]) => void;
};

export const EventCardLayout = ({
  type,
  onMouseDown,
  tooltip,
  isDisabled,
  children,
}: Props) => {
  const { draggedEventType } = useBlockDnd();
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    setIsMouseDown(draggedEventType === type);
  }, [draggedEventType, type]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDisabled) return;
    onMouseDown(e, type as TDraggableEvent["type"]);
  };

  return (
    <Tooltip.Root disabled={!tooltip}>
      <Tooltip.Trigger
        render={
          <Flex pos="relative">
            <HStack
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.800")}
              rounded="lg"
              flex="1"
              cursor={isDisabled ? "not-allowed" : "grab"}
              minH={isMouseDown ? "42px" : undefined}
              opacity={isMouseDown || isDisabled ? "0.4" : "1"}
              onMouseDown={handleMouseDown}
              px="4"
              py="2"
              _hover={useColorModeValue(
                { shadow: isDisabled ? undefined : "md" },
                { bgColor: "gray.900" },
              )}
              transition="box-shadow 200ms, background-color 200ms"
            >
              {!isMouseDown ? children : null}
            </HStack>
          </Flex>
        }
      />
      <Tooltip.Popup>{tooltip}</Tooltip.Popup>
    </Tooltip.Root>
  );
};
