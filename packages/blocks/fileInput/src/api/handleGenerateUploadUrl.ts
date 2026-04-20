import { ORPCError } from "@orpc/server";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { env } from "@typebot.io/env";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { parseAllowedFileTypesMetadata } from "@typebot.io/lib/extensionFromMimeType";
import { generatePresignedPutUrl } from "@typebot.io/lib/s3/generatePresignedPutUrl";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { basename } from "path";
import { z } from "zod";

export const generateUploadUrlInputSchema = z.object({
  sessionId: z.string(),
  blockId: z.string(),
  fileName: z.string(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export const handleGenerateUploadUrl = async ({
  input: { fileName, sessionId, fileType, blockId, fileSize },
}: {
  input: z.infer<typeof generateUploadUrlInputSchema>;
}) => {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message:
        "S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY",
    });

  const session = await getSession(sessionId);

  if (!session?.state)
    throw new ORPCError("BAD_REQUEST", {
      message: "Can't find session",
    });

  const typebotId = session.state.typebotsQueue[0].typebot.id;

  const isPreview = !session.state.typebotsQueue[0].resultId;

  const typebot = session.state.typebotsQueue[0].resultId
    ? await getAndParsePublicTypebot(session.state.typebotsQueue[0].typebot.id)
    : session.state.typebotsQueue[0].typebot;

  if (!typebot?.version)
    throw new ORPCError("BAD_REQUEST", {
      message: "Can't find typebot",
    });

  if (session.state.currentBlockId === undefined)
    throw new ORPCError("BAD_REQUEST", {
      message: "Can't find currentBlockId in session state",
    });

  const { block } = getBlockById(
    session.state.currentBlockId,
    parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
    }),
  );

  if (
    block?.type !== InputBlockType.FILE &&
    (block.type !== InputBlockType.TEXT ||
      !block.options?.attachments?.isEnabled) &&
    (block.type !== InputBlockType.TEXT || !block.options?.audioClip?.isEnabled)
  )
    throw new ORPCError("BAD_REQUEST", {
      message: "Current block does not expect file upload",
    });

  const allowedFileTypesMetadata =
    block.type === InputBlockType.FILE &&
    block.options?.allowedFileTypes &&
    block.options?.allowedFileTypes.types &&
    block.options?.allowedFileTypes.types.length > 0 &&
    block.options?.allowedFileTypes.isEnabled
      ? parseAllowedFileTypesMetadata(block.options.allowedFileTypes.types)
      : undefined;

  if (
    allowedFileTypesMetadata?.length &&
    (!fileType ||
      !allowedFileTypesMetadata.some(
        (metadata) => metadata.mimeType === fileType,
      ))
  )
    throw new ORPCError("BAD_REQUEST", {
      message: `File type ${fileType} not allowed`,
    });

  const { visibility, maxFileSize } = parseFileUploadParams(block);

  if (maxFileSize && fileSize && fileSize > maxFileSize * 1024 * 1024)
    throw new ORPCError("BAD_REQUEST", {
      message: `File size exceeds the ${maxFileSize}MB limit`,
    });

  const resultId = session.state.typebotsQueue[0].resultId;

  const safeFileName = basename(fileName);
  const filePath =
    "workspaceId" in typebot && typebot.workspaceId && resultId
      ? `${visibility === "Private" ? "private" : "public"}/workspaces/${
          typebot.workspaceId
        }/typebots/${typebotId}/results/${resultId}/blocks/${blockId}/${safeFileName}`
      : `public/tmp/typebots/${typebotId}/blocks/${blockId}/${safeFileName}`;

  const { presignedUrl, fileUrl: defaultFileUrl, fileType: resolvedFileType, maxFileSize: maxFileSizeMB } = await generatePresignedPutUrl({
    fileType,
    filePath,
    maxFileSize,
  });

  return {
    presignedUrl,
    fileType: resolvedFileType,
    maxFileSize: maxFileSizeMB,
    fileUrl:
      visibility === "Private" && !isPreview
        ? `${env.NEXTAUTH_URL}/api/typebots/${typebotId}/results/${resultId}/blocks/${blockId}/${safeFileName}`
        : defaultFileUrl,
  };
};

const getAndParsePublicTypebot = async (typebotId: string) => {
  const publicTypebot = (await prisma.publicTypebot.findFirst({
    where: {
      typebotId,
    },
    select: {
      version: true,
      groups: true,
      typebot: {
        select: {
          workspaceId: true,
        },
      },
    },
  })) as (Prisma.PublicTypebot & { typebot: { workspaceId: string } }) | null;

  return {
    ...publicTypebot,
    workspaceId: publicTypebot?.typebot.workspaceId,
  };
};

const parseFileUploadParams = (
  block: FileInputBlock | TextInputBlock,
): { visibility: "Public" | "Private"; maxFileSize: number | undefined } => {
  if (block.type === InputBlockType.FILE) {
    return {
      visibility:
        block.options?.visibility === "Private" ? "Private" : "Public",
      maxFileSize:
        block.options && "sizeLimit" in block.options
          ? (block.options.sizeLimit as number)
          : env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
    };
  }

  return {
    visibility:
      block.options?.attachments?.visibility === "Private"
        ? "Private"
        : "Public",
    maxFileSize: env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
  };
};
