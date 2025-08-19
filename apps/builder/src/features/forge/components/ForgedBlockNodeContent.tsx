import { SetVariableLabel } from "@/components/SetVariableLabel";
import { ThunderIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack, Text } from "@chakra-ui/react";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useMemo } from "react";
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
    if (!actionDef?.run?.stream?.getStreamVariableId) return false;
    const variable = typebot?.variables.find(
      (variable) =>
        variable.id ===
        actionDef.run!.stream!.getStreamVariableId(block.options),
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
    actionDef?.run,
    block.options,
    indices.blockIndex,
    indices.groupIndex,
    typebot?.groups,
    typebot?.variables,
  ]);

  const setVariableIds = actionDef?.getSetVariableIds?.(block.options) ?? [];

  const isConfigured =
    block.options?.action && (!blockDef?.auth || block.options.credentialsId);
  return (
    <Stack>
      <Text color={isConfigured ? "currentcolor" : "gray.500"} noOfLines={1}>
        {isConfigured
          ? actionDef?.parseBlockNodeLabel
            ? actionDef.parseBlockNodeLabel(block.options)
            : block.options.action
          : "Configure..."}
      </Text>
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
            <ThunderIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup>Text bubble content will be streamed</Tooltip.Popup>
        </Tooltip.Root>
      )}
    </Stack>
  );
};
