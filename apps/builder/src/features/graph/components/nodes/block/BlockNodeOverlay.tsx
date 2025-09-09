import { HStack, type StackProps, useColorModeValue } from "@chakra-ui/react";
import type {
  BlockIndices,
  BlockV6,
} from "@typebot.io/blocks-core/schemas/schema";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockNodeContent } from "./BlockNodeContent";

export const BlockNodeOverlay = ({
  block,
  indices,
  ...props
}: { block: BlockV6; indices: BlockIndices } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      rounded="lg"
      borderColor={useColorModeValue("gray.200", "gray.900")}
      bgColor={useColorModeValue("gray.50", "gray.900")}
      cursor={"grab"}
      w="264px"
      pointerEvents="none"
      shadow="md"
      {...props}
    >
      <BlockIcon type={block.type} />
      <BlockNodeContent block={block} indices={indices} groupId="" />
    </HStack>
  );
};
