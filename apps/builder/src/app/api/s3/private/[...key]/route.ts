import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { NextRequest } from "next/server";
import { auth } from "@/features/auth/lib/nextAuth";

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

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) => {
  const session = await auth();

  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const keySegments = (await params).key ?? [];
  const s3Key = keySegments.map(decodeURIComponent).join("/");

  const patterns = Object.keys(pathAuthorizationCheckers);
  const match = matchPathPattern(s3Key, patterns);

  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const authChecker = pathAuthorizationCheckers[match.pattern];
  const isAuthorized = await authChecker(match.params, {
    id: session.user.id,
    email: session.user.email,
  });

  if (!isAuthorized) return new Response("Forbidden", { status: 403 });

  const tmpUrl = await getFileTempUrl({ key: `private/${s3Key}` });

  if (!tmpUrl) {
    return new Response("File not found", { status: 404 });
  }

  return Response.redirect(tmpUrl);
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
