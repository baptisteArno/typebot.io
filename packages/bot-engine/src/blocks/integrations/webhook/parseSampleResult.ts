import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { byId, isNotDefined } from "@typebot.io/lib/utils";
import { parseResultHeader } from "@typebot.io/results/parseResultHeader";
import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { Variable } from "@typebot.io/variables/schemas";

export const parseSampleResult =
  (
    typebot: Pick<Typebot | PublicTypebot, "groups" | "variables" | "edges">,
    linkedTypebots: (Typebot | PublicTypebot)[],
    userEmail?: string,
  ) =>
  async (
    currentGroupId: string,
    variables: Variable[],
  ): Promise<Record<string, string | boolean | undefined>> => {
    const header = parseResultHeader(typebot, linkedTypebots);
    const linkedInputBlocks = await extractLinkedInputBlocks(
      typebot,
      linkedTypebots,
    )(currentGroupId);

    return {
      message: "This is a sample result, it has been generated ⬇️",
      submittedAt: new Date().toISOString(),
      ...parseResultSample(linkedInputBlocks, header, variables, userEmail),
    };
  };

const extractLinkedInputBlocks =
  (
    typebot: Pick<Typebot | PublicTypebot, "groups" | "variables" | "edges">,
    linkedTypebots: (Typebot | PublicTypebot)[],
  ) =>
  async (
    currentGroupId?: string,
    direction: "backward" | "forward" = "backward",
  ): Promise<InputBlock[]> => {
    const previousLinkedTypebotBlocks = walkEdgesAndExtract(
      "linkedBot",
      direction,
      typebot,
    )({
      groupId: currentGroupId,
    }) as TypebotLinkBlock[];

    const linkedBotInputs =
      previousLinkedTypebotBlocks.length > 0
        ? await Promise.all(
            previousLinkedTypebotBlocks.map((linkedBot) => {
              const linkedTypebot = linkedTypebots.find((t) =>
                "typebotId" in t
                  ? t.typebotId === linkedBot.options?.typebotId
                  : t.id === linkedBot.options?.typebotId,
              );
              if (!linkedTypebot) return [];
              return extractLinkedInputBlocks(linkedTypebot, linkedTypebots)(
                linkedBot.options?.groupId,
                "forward",
              );
            }),
          )
        : [];

    return (
      walkEdgesAndExtract(
        "input",
        direction,
        typebot,
      )({
        groupId: currentGroupId,
      }) as InputBlock[]
    ).concat(linkedBotInputs.flat());
  };

const parseResultSample = (
  inputBlocks: InputBlock[],
  headerCells: ResultHeaderCell[],
  variables: Variable[],
  userEmail?: string,
) =>
  headerCells.reduce<Record<string, string | (string | null)[] | undefined>>(
    (resultSample, cell) => {
      const inputBlock = inputBlocks.find((inputBlock) =>
        cell.blocks?.some((block) => block.id === inputBlock.id),
      );
      if (isNotDefined(inputBlock)) {
        if (cell.variableIds) {
          const variableValue = variables.find(
            (variable) =>
              cell.variableIds?.includes(variable.id) && variable.value,
          )?.value;
          return {
            ...resultSample,
            [cell.label]: variableValue ?? "content",
          };
        }

        return resultSample;
      }
      const variableValue = variables.find(
        (variable) => cell.variableIds?.includes(variable.id) && variable.value,
      )?.value;
      const value = variableValue ?? getSampleValue(inputBlock, userEmail);
      return {
        ...resultSample,
        [cell.label]: value,
      };
    },
    {},
  );

const getSampleValue = (block: InputBlock, userEmail?: string): string => {
  switch (block.type) {
    case InputBlockType.CHOICE:
      return block.options?.isMultipleChoice
        ? block.items.map((item) => item.content).join(", ")
        : (block.items[0]?.content ?? "Item");
    case InputBlockType.DATE:
      return new Date().toUTCString();
    case InputBlockType.EMAIL:
      return userEmail ?? "test@email.com";
    case InputBlockType.NUMBER:
      return "20";
    case InputBlockType.PHONE:
      return "+33665566773";
    case InputBlockType.TEXT:
      return "answer value";
    case InputBlockType.URL:
      return "https://test.com";
    case InputBlockType.FILE:
      return "https://domain.com/fake-file.png";
    case InputBlockType.RATING:
      return "8";
    case InputBlockType.PAYMENT:
      return "Success";
    case InputBlockType.PICTURE_CHOICE:
      return block.options?.isMultipleChoice
        ? block.items.map((item) => item.title ?? item.pictureSrc).join(", ")
        : (block.items[0]?.title ?? block.items[0]?.pictureSrc ?? "Item");
  }
};

const walkEdgesAndExtract =
  (
    type: "input" | "linkedBot",
    direction: "backward" | "forward",
    typebot: Pick<Typebot | PublicTypebot, "groups" | "variables" | "edges">,
  ) =>
  ({ groupId }: { groupId?: string }): Block[] => {
    const currentGroupId =
      groupId ??
      (typebot.groups.find((b) => b.blocks[0].type === "start")?.id as string);
    const blocksInGroup = extractBlocksInGroup(
      type,
      typebot,
    )({
      groupId: currentGroupId,
    });
    const otherGroupIds = getGroupIdsLinkedToGroup(
      typebot,
      direction,
    )(currentGroupId);
    return blocksInGroup.concat(
      otherGroupIds.flatMap((groupId) =>
        extractBlocksInGroup(type, typebot)({ groupId }),
      ),
    );
  };

const getGroupIdsLinkedToGroup =
  (
    typebot: Pick<Typebot | PublicTypebot, "groups" | "variables" | "edges">,
    direction: "backward" | "forward",
    visitedGroupIds: string[] = [],
  ) =>
  (groupId: string): string[] => {
    const linkedGroupIds = typebot.edges.reduce<string[]>((groupIds, edge) => {
      const fromGroupId = typebot.groups.find((g) =>
        g.blocks.some(
          (b) => "blockId" in edge.from && b.id === edge.from.blockId,
        ),
      )?.id;
      if (!fromGroupId) return groupIds;
      if (direction === "forward") {
        if (
          (!visitedGroupIds || !visitedGroupIds?.includes(edge.to.groupId)) &&
          fromGroupId === groupId
        ) {
          visitedGroupIds.push(edge.to.groupId);
          return groupIds.concat(edge.to.groupId);
        }
        return groupIds;
      }
      if (
        !visitedGroupIds.includes(fromGroupId) &&
        edge.to.groupId === groupId
      ) {
        visitedGroupIds.push(fromGroupId);
        return groupIds.concat(fromGroupId);
      }
      return groupIds;
    }, []);
    return linkedGroupIds.concat(
      linkedGroupIds.flatMap(
        getGroupIdsLinkedToGroup(typebot, direction, visitedGroupIds),
      ),
    );
  };

const extractBlocksInGroup =
  (
    type: "input" | "linkedBot",
    typebot: Pick<Typebot | PublicTypebot, "groups" | "variables" | "edges">,
  ) =>
  ({ groupId, blockId }: { groupId: string; blockId?: string }) => {
    const currentGroup = typebot.groups.find(byId(groupId));
    if (!currentGroup) return [];
    const blocks: Block[] = [];
    for (const block of currentGroup.blocks) {
      if (block.id === blockId) break;
      if (type === "input" && isInputBlock(block)) blocks.push(block);
      if (type === "linkedBot" && block.type === LogicBlockType.TYPEBOT_LINK)
        blocks.push(block);
    }
    return blocks;
  };
