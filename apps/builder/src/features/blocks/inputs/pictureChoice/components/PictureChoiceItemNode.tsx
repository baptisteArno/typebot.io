import { ImageIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import {
  Flex,
  Image,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/schema";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { isSvgSrc } from "@typebot.io/lib/utils";
import { Popover } from "@typebot.io/ui/components/Popover";
import type React from "react";
import { useRef } from "react";
import { PictureChoiceItemSettings } from "./PictureChoiceItemSettings";

type Props = {
  item: PictureChoiceItem;
  indices: ItemIndices;
  isMouseOver: boolean;
};

export const PictureChoiceItemNode = ({ item, indices }: Props) => {
  const emptyImageBgColor = useColorModeValue("gray.100", "gray.700");
  const { updateItem, typebot } = useTypebot();
  const ref = useRef<HTMLDivElement | null>(null);
  const { openedNodeId, setOpenedNodeId } = useGraph();

  const handleItemChange = (updates: Partial<PictureChoiceItem>) => {
    updateItem(indices, { ...item, ...updates });
  };

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };
  useEventListener("wheel", handleMouseWheel, ref.current);

  const blockId = typebot
    ? typebot.groups.at(indices.groupIndex)?.blocks?.at(indices.blockIndex)?.id
    : undefined;

  return (
    <Popover.Root
      isOpen={openedNodeId === item.id}
      onOpen={() => setOpenedNodeId(item.id)}
      onClose={() => setOpenedNodeId(undefined)}
    >
      <Popover.Trigger
        render={(props) => (
          <Flex
            {...props}
            px={4}
            py={2}
            justify="center"
            w="full"
            pos="relative"
            data-testid="item-node"
            userSelect="none"
          >
            {item.pictureSrc ? (
              <Image
                src={item.pictureSrc}
                alt="Picture choice image"
                rounded="md"
                maxH={isSvgSrc(item.pictureSrc) ? "64px" : "128px"}
                w="full"
                objectFit={isSvgSrc(item.pictureSrc) ? "contain" : "cover"}
                p={isSvgSrc(item.pictureSrc) ? "2" : undefined}
                userSelect="none"
                draggable={false}
              />
            ) : (
              <Flex
                width="full"
                height="100px"
                bgColor={emptyImageBgColor}
                rounded="md"
                justify="center"
                align="center"
              >
                <ImageIcon />
              </Flex>
            )}
          </Flex>
        )}
      ></Popover.Trigger>
      <Popover.Popup side="right" className="p-4">
        {typebot && blockId && (
          <PictureChoiceItemSettings
            workspaceId={typebot.workspaceId}
            typebotId={typebot.id}
            item={item}
            blockId={blockId}
            onItemChange={handleItemChange}
          />
        )}
      </Popover.Popup>
    </Popover.Root>
  );
};
