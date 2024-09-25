import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";
import { Flex, HStack, Tooltip, useColorModeValue } from "@chakra-ui/react";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { useEffect, useState } from "react";

type Props = {
  type: BlockV6["type"];
  tooltip?: string;
  isDisabled?: boolean;
  children: React.ReactNode;
  onMouseDown: (e: React.MouseEvent, type: BlockV6["type"]) => void;
};

export const BlockCardLayout = ({
  type,
  onMouseDown,
  tooltip,
  children,
}: Props) => {
  const { draggedBlockType } = useBlockDnd();
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    setIsMouseDown(draggedBlockType === type);
  }, [draggedBlockType, type]);

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type);

  return (
    <Tooltip label={tooltip}>
      <Flex pos="relative">
        <HStack
          borderWidth="1px"
          borderColor={useColorModeValue("gray.200", "gray.800")}
          rounded="lg"
          flex="1"
          cursor={"grab"}
          opacity={isMouseDown ? "0.4" : "1"}
          onMouseDown={handleMouseDown}
          bgColor={useColorModeValue("gray.50", "gray.850")}
          px="4"
          py="2"
          _hover={useColorModeValue({ shadow: "md" }, { bgColor: "gray.800" })}
          transition="box-shadow 200ms, background-color 200ms"
        >
          {!isMouseDown ? children : null}
        </HStack>
      </Flex>
    </Tooltip>
  );
};
