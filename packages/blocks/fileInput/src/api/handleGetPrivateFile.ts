import { ORPCError } from "@orpc/server";
import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { z } from "zod";

export const getPrivateFileInputSchema = z.object({
  rest: z.string(),
});

type PathParams = Record<string, string>;

type User = {
  id: string;
  email: string | null;
};

const pathAuthorizationCheckers: Record<
  string,
  (params: PathParams, user: User) => Promise<boolean>
> = {
  "tmp/workspaces/{workspaceId}/typebots/{typebotId}/results-exports/{exportId}":
    async (params, user) => {
      const typebot = await prisma.typebot.findFirst({
        where: {
          id: params.typebotId,
        },
        select: {
          whatsAppCredentialsId: true,
          collaborators: {
            select: {
              userId: true,
            },
          },
          workspace: {
            select: {
              id: true,
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      return Boolean(
        typebot?.workspace && !(await isReadTypebotForbidden(typebot, user)),
      );
    },
};

export const handleGetPrivateFile = async ({
  input: { rest },
  context: { user },
}: {
  input: z.infer<typeof getPrivateFileInputSchema>;
  context: { user: { id: string; email: string | null } };
}) => {
  const s3Key = decodeURIComponent(rest);

  const patterns = Object.keys(pathAuthorizationCheckers);
  const match = matchPathPattern(s3Key, patterns);

  if (!match) {
    throw new ORPCError("NOT_FOUND", {
      message: "Not found",
    });
  }

  const authChecker = pathAuthorizationCheckers[match.pattern];
  const isAuthorized = await authChecker(match.params, {
    id: user.id,
    email: user.email,
  });

  if (!isAuthorized)
    throw new ORPCError("FORBIDDEN", {
      message: "Forbidden",
    });

  const tmpUrl = await getFileTempUrl({ key: `private/${s3Key}` });

  if (!tmpUrl) {
    throw new ORPCError("NOT_FOUND", {
      message: "File not found",
    });
  }

  return {
    headers: {
      location: tmpUrl,
    },
  };
};

const matchPathPattern = (
  path: string,
  patterns: string[],
): { pattern: string; params: PathParams } | null => {
  for (const pattern of patterns) {
    const patternSegments = pattern.split("/");
    const pathSegments = path.split("/");

    if (patternSegments.length !== pathSegments.length) continue;

    const params: PathParams = {};
    let isMatch = true;

    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i];
      const pathSegment = pathSegments[i];

      if (patternSegment.startsWith("{") && patternSegment.endsWith("}")) {
        const paramName = patternSegment.slice(1, -1);
        params[paramName] = pathSegment;
      } else if (patternSegment !== pathSegment) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return { pattern, params };
    }
  }

  return null;
};
