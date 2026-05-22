import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import {
  createUploadSlotFilePath,
  isUnsafeUploadFileType,
  parseUploadPathSegment,
  resolveUploadFileType,
} from "@typebot.io/lib/s3/createUploadFilePath";
import { resolveUploadProxyBaseUrl } from "@typebot.io/lib/s3/resolveUploadProxyBaseUrl";
import { generateSignedUploadProxyUrl } from "@typebot.io/lib/s3/signedUploadProxy";
import prisma from "@typebot.io/prisma";
import { z } from "zod";
import { isWriteTypebotForbidden } from "@/features/typebot/helpers/isWriteTypebotForbidden";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

const inputSchema = z.object({
  filePathProps: z
    .object({
      workspaceId: z.string(),
      typebotId: z.string(),
      blockId: z.string(),
      itemId: z.string().optional(),
    })
    .or(
      z.object({
        workspaceId: z.string(),
        typebotId: z.string(),
        fileName: z.string(),
      }),
    )
    .or(
      z.object({
        userId: z.string(),
        fileName: z.string(),
      }),
    )
    .or(
      z.object({
        workspaceId: z.string(),
        spaceId: z.string().optional(),
        fileName: z.string(),
      }),
    ),
  fileType: z.string().optional(),
});

export type FilePathUploadProps = z.infer<
  typeof inputSchema.shape.filePathProps
>;

export const generateUploadUrl = authenticatedProcedure
  .input(inputSchema)
  .handler(
    async ({
      input: { filePathProps, fileType },
      context: { apiOrigin, user },
    }) => {
      if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message:
            "S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY",
        });

      const resolvedFileType = resolveUploadFileType(fileType);
      if (isUnsafeUploadFileType(resolvedFileType))
        throw new ORPCError("BAD_REQUEST", {
          message:
            "File type not allowed. SVG, HTML, XML, and JavaScript files cannot be uploaded.",
        });

      if ("resultId" in filePathProps && !user)
        throw new ORPCError("UNAUTHORIZED", {
          message: "You must be logged in to upload a file",
        });

      const filePath = await parseFilePath({
        authenticatedUserId: user?.id,
        uploadProps: filePathProps,
      });

      return generateSignedUploadProxyUrl({
        baseUrl: resolveUploadProxyBaseUrl({
          publicBaseUrls: [env.NEXTAUTH_URL],
          fallbackBaseUrl: env.NEXTAUTH_URL,
          requestOrigin: apiOrigin,
        }),
        fileType: resolvedFileType,
        filePath,
      });
    },
  );

type Props = {
  authenticatedUserId?: string;
  uploadProps: FilePathUploadProps;
};

const parseFilePath = async ({
  authenticatedUserId,
  uploadProps: input,
}: Props): Promise<string> => {
  if (!authenticatedUserId)
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to upload this type of file",
    });
  if ("userId" in input) {
    if (input.userId !== authenticatedUserId)
      throw new ORPCError("UNAUTHORIZED", {
        message: "You are not authorized to upload a file for this user",
      });
    return createUploadSlotFilePath({
      prefix: `public/users/${input.userId}`,
      fileName: parsePathSegment(input.fileName),
    });
  }
  if (!("workspaceId" in input))
    throw new ORPCError("BAD_REQUEST", { message: "workspaceId is missing" });
  if (!("typebotId" in input)) {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: input.workspaceId,
      },
      select: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });
    if (
      !workspace ||
      isWriteWorkspaceForbidden(workspace, { id: authenticatedUserId })
    )
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });
    if (input.spaceId) {
      return createUploadSlotFilePath({
        prefix: `public/workspaces/${input.workspaceId}/spaces/${parsePathSegment(input.spaceId)}`,
        fileName: parsePathSegment(input.fileName),
      });
    }
    return createUploadSlotFilePath({
      prefix: `public/workspaces/${input.workspaceId}`,
      fileName: parsePathSegment(input.fileName),
    });
  }
  const typebot = await prisma.typebot.findUnique({
    where: {
      id: input.typebotId,
    },
    select: {
      workspace: {
        select: {
          plan: true,
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      },
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
      workspaceId: true,
    },
  });
  if (
    !typebot ||
    (await isWriteTypebotForbidden(typebot, {
      id: authenticatedUserId,
    }))
  )
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });
  if (!("blockId" in input)) {
    return createUploadSlotFilePath({
      prefix: `public/workspaces/${typebot.workspaceId}/typebots/${input.typebotId}`,
      fileName: parsePathSegment(input.fileName),
    });
  }
  return `public/workspaces/${typebot.workspaceId}/typebots/${
    input.typebotId
  }/blocks/${parsePathSegment(input.blockId)}${
    input.itemId ? `/items/${parsePathSegment(input.itemId)}` : ""
  }`;
};

const parsePathSegment = (pathSegment: string) => {
  try {
    return parseUploadPathSegment(pathSegment);
  } catch {
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid upload path segment",
    });
  }
};
