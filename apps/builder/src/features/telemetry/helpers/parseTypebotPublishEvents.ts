import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/schemas";
import prisma from "@typebot.io/prisma";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

type Props = {
  existingTypebot: Pick<Typebot, "id" | "workspaceId">;
  userId: string;
  hasFileUploadBlocks: boolean;
};

export const parseTypebotPublishEvents = async ({
  existingTypebot,
  userId,
  hasFileUploadBlocks,
}: Props) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return [];
  const events = [];
  const existingPublishedTypebot = await prisma.publicTypebot.findFirst({
    where: {
      typebotId: existingTypebot.id,
    },
    select: {
      version: true,
      groups: true,
      settings: true,
    },
  });

  const isPublishingFileUploadBlockForTheFirstTime =
    hasFileUploadBlocks &&
    (!existingPublishedTypebot ||
      !parseGroups(existingPublishedTypebot.groups, {
        typebotVersion: existingPublishedTypebot.version,
      }).some((group) =>
        group.blocks.some((block) => block.type === InputBlockType.FILE),
      ));

  if (isPublishingFileUploadBlockForTheFirstTime)
    events.push({
      name: "File upload block published",
      workspaceId: existingTypebot.workspaceId,
      typebotId: existingTypebot.id,
      userId,
    } as const);

  return events;
};
