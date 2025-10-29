import { defaultAbTestOptions } from "@typebot.io/blocks-logic/abTest/constants";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import { Badge } from "@typebot.io/ui/components/Badge";
import { BlockSourceEndpoint } from "@/features/graph/components/endpoints/BlockSourceEndpoint";

type Props = {
  block: AbTestBlock;
  groupId: string;
};

export const AbTestNodeBody = ({ block, groupId }: Props) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex relative items-center shadow-sm rounded-md border w-full bg-gray-1">
        <p className="p-3">
          A{" "}
          <Badge>
            {block.options?.aPercent ?? defaultAbTestOptions.aPercent}%
          </Badge>
        </p>
        <BlockSourceEndpoint
          source={{
            blockId: block.id,
            itemId: block.items[0].id,
          }}
          groupId={groupId}
          className="absolute right-[-49px] pointer-events-[all]"
        />
      </div>
      <div className="flex relative items-center shadow-sm rounded-md border w-full bg-gray-1">
        <p className="p-3">
          B{" "}
          <Badge>
            {100 - (block.options?.aPercent ?? defaultAbTestOptions.aPercent)}%
          </Badge>
        </p>
        <BlockSourceEndpoint
          source={{
            blockId: block.id,
            itemId: block.items[1].id,
          }}
          groupId={groupId}
          className="absolute right-[-49px] pointer-events-[all]"
        />
      </div>
    </div>
  );
};
