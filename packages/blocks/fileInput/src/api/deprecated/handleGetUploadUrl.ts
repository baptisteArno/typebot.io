import { ORPCError } from "@orpc/server";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { generatePresignedUrl } from "@typebot.io/lib/s3/deprecated/generatePresignedUrl";
import { byId, isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

export const getUploadUrlInputSchema = z.object({
  typebotId: z.string(),
  blockId: z.string(),
  filePath: z.string(),
  fileType: z.string().optional(),
});

export const handleGetUploadUrl = async ({
  input: { typebotId, blockId, filePath, fileType },
}: {
  input: z.infer<typeof getUploadUrlInputSchema>;
}) => {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message:
        "S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY",
    });

  const publicTypebot = await prisma.publicTypebot.findFirst({
    where: { typebotId },
    select: {
      version: true,
      groups: true,
      typebotId: true,
    },
  });

  if (!publicTypebot)
    throw new ORPCError("BAD_REQUEST", {
      message: "Typebot not found",
    });

  const fileUploadBlock = await getFileUploadBlock(publicTypebot, blockId);

  if (!fileUploadBlock)
    throw new ORPCError("BAD_REQUEST", {
      message: "File upload block not found",
    });

  const presignedUrl = await generatePresignedUrl({
    fileType,
    filePath,
  });

  return {
    presignedUrl,
    hasReachedStorageLimit: false,
  };
};

const getFileUploadBlock = async (
  publicTypebot: Pick<Prisma.PublicTypebot, "groups" | "typebotId" | "version">,
  blockId: string,
): Promise<FileInputBlock | null> => {
  const groups = parseGroups(publicTypebot.groups, {
    typebotVersion: publicTypebot.version,
  });
  const fileUploadBlock = groups
    .flatMap<Block>((group) => group.blocks)
    .find(byId(blockId));
  if (fileUploadBlock?.type === InputBlockType.FILE) return fileUploadBlock;
  const linkedTypebotIds = groups
    .flatMap<Block>((group) => group.blocks)
    .filter((block) => block.type === LogicBlockType.TYPEBOT_LINK)
    .flatMap((block) => (block as TypebotLinkBlock).options?.typebotId)
    .filter(isDefined);
  const linkedTypebots = await prisma.publicTypebot.findMany({
    where: { typebotId: { in: linkedTypebotIds } },
    select: {
      groups: true,
    },
  });
  const fileUploadBlockFromLinkedTypebots = parseGroups(
    linkedTypebots.flatMap((typebot) => typebot.groups),
    { typebotVersion: publicTypebot.version },
  )
    .flatMap<Block>((group) => group.blocks)
    .find(byId(blockId));
  if (fileUploadBlockFromLinkedTypebots?.type === InputBlockType.FILE)
    return fileUploadBlockFromLinkedTypebots;
  return null;
};
