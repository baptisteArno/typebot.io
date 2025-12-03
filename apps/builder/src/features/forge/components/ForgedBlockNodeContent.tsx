import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { ZapIcon } from "@typebot.io/ui/icons/ZapIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useMemo } from "react";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useForgedBlock } from "../hooks/useForgedBlock";

type Props = {
  block: ForgedBlock;
  indices: BlockIndices;
};
export const ForgedBlockNodeContent = ({ block, indices }: Props) => {
  const { blockDef, actionDef } = useForgedBlock({
    nodeType: block.type,
    action: block.options?.action,
  });
  const { typebot } = useTypebot();

  const isStreamingNextBlock = useMemo(() => {
    if (!actionDef?.getStreamVariableId) return false;
    const variable = typebot?.variables.find(
      (variable) =>
        variable.id === actionDef.getStreamVariableId?.(block.options),
    );
    if (!variable) return false;
    const nextBlock =
      typebot?.groups[indices.groupIndex]?.blocks[indices.blockIndex + 1];
    return (
      nextBlock?.type === BubbleBlockType.TEXT &&
      nextBlock.content?.richText?.length === 1 &&
      nextBlock.content.richText[0].type === "p" &&
      nextBlock.content.richText[0].children.length === 1 &&
      nextBlock.content.richText[0].children[0].text === `{{${variable.name}}}`
    );
  }, [
    actionDef?.getStreamVariableId,
    block.options,
    indices.blockIndex,
    indices.groupIndex,
    typebot?.groups,
    typebot?.variables,
  ]);

  const setVariableIds = (
    actionDef?.getSetVariableIds?.(block.options) ?? []
  ).concat(actionDef?.getEmbedSaveVariableId?.(block.options) ?? []);

  const isConfigured =
    block.options?.action && (!blockDef?.auth || block.options.credentialsId);
  return (
    <div className="flex flex-col gap-2">
      <p
        className={cn(
          "truncate",
          isConfigured ? "text-gray-12" : "text-gray-9",
        )}
      >
        {isConfigured
          ? actionDef?.parseBlockNodeLabel
            ? actionDef.parseBlockNodeLabel(block.options)
            : block.options.action
          : "Configure..."}
      </p>
      {typebot &&
        isConfigured &&
        setVariableIds.map((variableId, idx) => (
          <SetVariableLabel
            key={variableId + idx}
            variables={typebot.variables}
            variableId={variableId}
          />
        ))}
      {isStreamingNextBlock && (
        <Tooltip.Root>
          <Tooltip.Trigger className="rounded-full size-6 p-1 bg-gray-3 text-purple-11 border absolute bottom-[-15px] left-[118px] z-10 flex items-center justify-center">
            <ZapIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup>Text bubble content will be streamed</Tooltip.Popup>
        </Tooltip.Root>
      )}
    </div>
  );
};
