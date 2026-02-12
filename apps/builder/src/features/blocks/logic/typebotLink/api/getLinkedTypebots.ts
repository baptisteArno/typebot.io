import { ORPCError } from "@orpc/server";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { preprocessTypebot } from "@typebot.io/typebot/preprocessTypebot";
import {
  typebotV5Schema,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { z } from "zod";

const pick = {
  version: true,
  groups: true,
  variables: true,
  name: true,
} as const;

const output = z.object({
  typebots: z.array(
    z.preprocess(
      preprocessTypebot,
      z.discriminatedUnion("version", [
        typebotV5Schema.pick(pick),
        typebotV6Schema.pick(pick),
      ]),
    ),
  ),
});

export const getLinkedTypebots = authenticatedProcedure
  .route({
    method: "GET",
    path: "/v1/typebots/{typebotId}/linkedTypebots",
    summary: "Get linked typebots",
    tags: ["Typebot"],
  })
  .input(
    z.object({
      typebotId: z.string(),
    }),
  )
  .output(output)
  .handler(async ({ input: { typebotId }, context: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        version: true,
        groups: true,
        variables: true,
        name: true,
        createdAt: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
        collaborators: {
          select: {
            type: true,
            userId: true,
          },
        },
      },
    });

    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new ORPCError("NOT_FOUND", { message: "No typebot found" });

    const linkedTypebotIds =
      parseGroups(typebot.groups, { typebotVersion: typebot.version })
        .flatMap((group) => group.blocks)
        .reduce<string[]>((typebotIds, block) => {
          if (block.type !== LogicBlockType.TYPEBOT_LINK) return typebotIds;
          const typebotId = block.options?.typebotId;
          if (
            isDefined(typebotId) &&
            !typebotIds.includes(typebotId) &&
            block.options?.mergeResults !== false
          )
            typebotIds.push(typebotId);
          return typebotIds;
        }, []) ?? [];

    if (!linkedTypebotIds.length) return { typebots: [] };

    const typebots = (
      await prisma.typebot.findMany({
        where: {
          isArchived: { not: true },
          id: { in: linkedTypebotIds },
        },
        select: {
          id: true,
          version: true,
          groups: true,
          variables: true,
          name: true,
          createdAt: true,
          workspace: {
            select: {
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
          collaborators: {
            select: {
              type: true,
              userId: true,
            },
          },
        },
      })
    )
      .filter(async (typebot) => !(await isReadTypebotForbidden(typebot, user)))
      // To avoid the out of sort memory error, we sort the typebots manually
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .map((typebot) => ({
        ...typebot,
        groups: parseGroups(typebot.groups, {
          typebotVersion: typebot.version,
        }),
        variables: typebotV6Schema.shape.variables.parse(typebot.variables),
      }));

    return {
      typebots,
    };
  });
