import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/schema";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { isSvgSrc } from "@typebot.io/lib/utils";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Image02Icon } from "@typebot.io/ui/icons/Image02Icon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useRef } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { useEventListener } from "@/hooks/useEventListener";
import { PictureChoiceItemSettings } from "./PictureChoiceItemSettings";

type Props = {
  item: PictureChoiceItem;
  indices: ItemIndices;
  isMouseOver: boolean;
};

export const PictureChoiceItemNode = ({ item, indices }: Props) => {
  const { updateItem, typebot } = useTypebot();
  const ref = useRef<HTMLDivElement | null>(null);
  const { openedNodeId, setOpenedNodeId } = useGraph();

  const handleItemChange = (updates: Partial<PictureChoiceItem>) => {
    updateItem(indices, { ...item, ...updates });
  };

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };
  useEventListener("wheel", handleMouseWheel, ref);

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
          <div
            className="flex px-4 py-2 justify-center w-full relative"
            {...props}
            data-testid="item-node"
            userSelect="none"
          >
            {item.pictureSrc ? (
              <img
                className={cx(
                  "rounded-md w-full select-none",
                  isSvgSrc(item.pictureSrc)
                    ? "max-h-[64px] object-contain p-2"
                    : "max-h-[128px] object-cover",
                )}
                src={item.pictureSrc}
                alt="Picture choice image"
              />
            ) : (
              <div className="flex w-full h-[100px] rounded-md justify-center items-center bg-gray-3">
                <Image02Icon />
              </div>
            )}
          </div>
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
