import type {
  BubbleBlock,
  BubbleBlockContent,
} from "@typebot.io/blocks-bubbles/schema";
import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import {
  isBubbleBlock,
  isInputBlock,
  isTextBubbleBlock,
} from "@typebot.io/blocks-core/helpers";
import type {
  Block,
  BlockV6,
  BlockWithOptions,
} from "@typebot.io/blocks-core/schemas/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { TEventWithOptions } from "@typebot.io/events/schemas";
import type { TurnableIntoParam } from "@typebot.io/forge/types";
import { isDefined } from "@typebot.io/lib/utils";
import type { TElement } from "@typebot.io/rich-text/plate";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { Popover } from "@typebot.io/ui/components/Popover";
import { cx } from "@typebot.io/ui/lib/cva";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ZodError, type ZodObject } from "zod";
import { fromZodError } from "zod-validation-error";
import { TextBubbleEditor } from "@/features/blocks/bubbles/textBubble/components/TextBubbleEditor";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useSelectionStore } from "@/features/graph/hooks/useSelectionStore";
import {
  type NodePosition,
  useBlockDnd,
  useDragDistance,
} from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { hasDefaultConnector } from "@/features/typebot/helpers/hasDefaultConnector";
import { setMultipleRefs } from "@/helpers/setMultipleRefs";
import { toast } from "@/lib/toast";
import { BlockSourceEndpoint } from "../../endpoints/BlockSourceEndpoint";
import { TargetEndpoint } from "../../endpoints/TargetEndpoint";
import { BlockNodeContent } from "./BlockNodeContent";
import { BlockNodeContextMenuPopup } from "./BlockNodeContextMenuPopup";
import { MediaBubblePopoverContent } from "./MediaBubblePopoverContent";
import { SettingsPopoverContent } from "./SettingsPopoverContent";

export const BlockNode = ({
  block,
  isConnectable,
  indices,
  onMouseDown,
}: {
  block: BlockV6;
  isConnectable: boolean;
  indices: { blockIndex: number; groupIndex: number };
  onMouseDown?: (blockNodePosition: NodePosition, block: BlockV6) => void;
}) => {
  const { pathname, query } = useRouter();
  const {
    setConnectingIds,
    connectingIds,
    openedNodeId,
    setOpenedNodeId,
    previewingEdge,
    isReadOnly,
    isAnalytics,
    previewingBlock,
  } = useGraph();
  const { mouseOverBlock, setMouseOverBlock } = useBlockDnd();
  const { typebot, updateBlock } = useTypebot();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
  const blockRef = useRef<HTMLDivElement | null>(null);
  const [isSettingsPopoverExpanded, setIsSettingsPopoverExpanded] =
    useState(false);

  const isPreviewing =
    isConnecting ||
    previewingEdge?.to.blockId === block.id ||
    previewingBlock?.id === block.id;

  const groupId = typebot?.groups.at(indices.groupIndex)?.id;

  const isDraggingGraph = useSelectionStore((state) => state.isDraggingGraph);

  const onDrag = (position: NodePosition) => {
    if (!onMouseDown) return;
    onMouseDown(position, block);
  };

  useDragDistance({
    ref: blockRef,
    onDrag,
    isDisabled: !onMouseDown,
    deps: [openedNodeId],
  });

  useEffect(() => {
    if (query.blockId?.toString() === block.id) setOpenedNodeId(block.id);
  }, [block.id, query, setOpenedNodeId]);

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === groupId &&
        connectingIds?.target?.blockId === block.id,
    );
  }, [connectingIds, block.id, groupId]);

  const handleMouseEnter = () => {
    if (isReadOnly) return;
    if (mouseOverBlock?.id !== block.id && blockRef.current)
      setMouseOverBlock({ id: block.id, ref: blockRef });
    if (connectingIds && groupId)
      setConnectingIds({
        ...connectingIds,
        target: { groupId, blockId: block.id },
      });
  };

  const handleMouseLeave = () => {
    if (mouseOverBlock) setMouseOverBlock(undefined);
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, blockId: undefined },
      });
  };

  const handleCloseEditor = () => {
    setOpenedNodeId(undefined);
  };

  const handleTextEditorChange = (content: TElement[]) => {
    const updatedBlock = { ...block, content: { richText: content } };
    updateBlock(indices, updatedBlock);
  };

  const handleBlockUpdate = (
    updates: Partial<BlockWithOptions | TEventWithOptions>,
  ) => updateBlock(indices, { ...block, ...updates });

  const handleContentChange = (content: BubbleBlockContent) =>
    updateBlock(indices, { ...block, content } as Block);

  useEffect(() => {
    if (!blockRef.current) return;
    const blockElement = blockRef.current;
    blockElement.addEventListener("pointerdown", (e) => e.stopPropagation());

    return () => {
      blockElement.removeEventListener("pointerdown", (e) =>
        e.stopPropagation(),
      );
    };
  }, []);

  const convertBlock = (
    turnIntoParams: TurnableIntoParam,
    targetBlockSchema: ZodObject<any>,
  ) => {
    if (!("options" in block) || !block.options) return;

    const convertedBlockOptions = turnIntoParams.transform
      ? turnIntoParams.transform(block.options)
      : block.options;
    try {
      updateBlock(
        indices,
        targetBlockSchema.parse({
          ...block,
          type: turnIntoParams.blockId,
          options: {
            ...convertedBlockOptions,
            credentialsId: undefined,
          },
        } as Block),
      );
      setOpenedNodeId(block.id);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error(validationError);
        toast({
          title: "Could not convert block",
          description: validationError.toString(),
        });
      } else {
        toast({
          title: "An error occured while converting the block",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };

  const hasIcomingEdge = typebot?.edges.some((edge) => {
    return edge.to.blockId === block.id;
  });

  return openedNodeId === block.id && isTextBubbleBlock(block) ? (
    <TextBubbleEditor
      id={block.id}
      initialValue={block.content?.richText ?? []}
      onChange={handleTextEditorChange}
      onClose={handleCloseEditor}
    />
  ) : (
    <Popover.Root
      isOpen={openedNodeId === block.id}
      onOpen={() => setOpenedNodeId(block.id)}
      onClose={() => setOpenedNodeId(undefined)}
      onCloseComplete={() => {
        setIsSettingsPopoverExpanded(false);
      }}
    >
      <Popover.Trigger
        render={(props) => (
          <ContextMenu.Root onOpenChange={setIsContextMenuOpened}>
            <ContextMenu.Trigger>
              <div
                className="flex relative w-full prevent-group-drag"
                {...props}
                ref={setMultipleRefs([blockRef, props.ref!])}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                data-testid={`block ${block.id}`}
                pointerEvents={isAnalytics || isDraggingGraph ? "none" : "auto"}
              >
                <div
                  className={cx(
                    "flex gap-2 flex-1 p-3 rounded-lg items-start w-full text-left select-none transition-[border-color] cursor-pointer bg-gray-2 dark:border-gray-3",
                    isContextMenuOpened || isPreviewing
                      ? "border-2 border-orange-8 dark:border-orange-8 -m-px"
                      : "border",
                  )}
                >
                  <BlockIcon type={block.type} className="mt-1" />
                  {typebot?.groups.at(indices.groupIndex)?.id && (
                    <BlockNodeContent
                      block={block}
                      indices={indices}
                      groupId={
                        typebot.groups.at(indices.groupIndex)?.id as string
                      }
                    />
                  )}
                  {(hasIcomingEdge || isDefined(connectingIds)) && (
                    <TargetEndpoint
                      className="absolute left-[-34px] top-[16px]"
                      blockId={block.id}
                      groupId={groupId}
                    />
                  )}
                  {(isConnectable ||
                    (pathname.endsWith("analytics") && isInputBlock(block))) &&
                    hasDefaultConnector(block) &&
                    groupId && (
                      <BlockSourceEndpoint
                        source={{
                          blockId: block.id,
                        }}
                        groupId={groupId}
                        className="absolute right-[-34px] bottom-[10px]"
                        isHidden={!isConnectable}
                      />
                    )}
                </div>
              </div>
            </ContextMenu.Trigger>
            <BlockNodeContextMenuPopup
              indices={indices}
              block={block}
              onTurnIntoClick={convertBlock}
            />
          </ContextMenu.Root>
        )}
      />
      {/* Prevent triggering parent group context menu */}
      <div onContextMenu={(e) => e.stopPropagation()}>
        {hasSettingsPopover(block) && (
          <SettingsPopoverContent
            node={block}
            groupId={groupId}
            onNodeChange={handleBlockUpdate}
            side="left"
            isExpanded={isSettingsPopoverExpanded}
            onExpandClick={() =>
              setIsSettingsPopoverExpanded(!isSettingsPopoverExpanded)
            }
          />
        )}
        {typebot && isMediaBubbleBlock(block) && (
          <MediaBubblePopoverContent
            uploadFileProps={{
              workspaceId: typebot.workspaceId,
              typebotId: typebot.id,
              blockId: block.id,
            }}
            block={block}
            side="left"
            onContentChange={handleContentChange}
          />
        )}
      </div>
    </Popover.Root>
  );
};

const hasSettingsPopover = (block: BlockV6): block is BlockWithOptions =>
  !isBubbleBlock(block) &&
  block.type !== LogicBlockType.CONDITION &&
  block.type !== LogicBlockType.RETURN;

const isMediaBubbleBlock = (
  block: BlockV6,
): block is Exclude<BubbleBlock, TextBubbleBlock> =>
  isBubbleBlock(block) && !isTextBubbleBlock(block);
