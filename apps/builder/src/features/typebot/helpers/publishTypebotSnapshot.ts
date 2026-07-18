import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { themeSchema } from "@typebot.io/theme/schemas";
import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import { publicTypebotSchemaV6 } from "@typebot.io/typebot/schemas/publicTypebot";
import {
  type TypebotVersion,
  typebotVersionSchema,
} from "@typebot.io/typebot/schemas/typebotVersion";
import { variableSchema } from "@typebot.io/variables/schemas";
import { z } from "zod";

type SnapshotSource = {
  id: string;
  version: string | null;
  edges: unknown;
  events: unknown;
  groups: unknown;
  settings: unknown;
  theme: unknown;
  variables: unknown;
};

export const parseTypebotSnapshotData = (typebot: SnapshotSource) => ({
  version: typebot.version,
  edges: z.array(edgeSchema).parse(typebot.edges),
  groups: parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  }),
  events:
    (isTypebotVersionAtLeastV6(typebot.version)
      ? publicTypebotSchemaV6.shape.events
      : z.null()
    ).parse(typebot.events) ?? undefined,
  settings: settingsSchema.parse(typebot.settings),
  variables: z.array(variableSchema).parse(typebot.variables),
  theme: themeSchema.parse(typebot.theme),
});

const createAndActivateTypebotVersionInternal = async ({
  typebot,
  userId,
}: {
  typebot: SnapshotSource;
  userId: string;
}) => {
  const snapshotData = parseTypebotSnapshotData(typebot);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const latestVersion = await tx.typebotVersion.findFirst({
          where: { typebotId: typebot.id },
          orderBy: { versionNumber: "desc" },
          select: { versionNumber: true },
        });
        const typebotVersion = await tx.typebotVersion.create({
          data: {
            ...snapshotData,
            typebotId: typebot.id,
            versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
            createdById: userId,
          },
        });
        const parsedTypebotVersion = typebotVersionSchema.parse(typebotVersion);
        await upsertActivePublicTypebot({
          tx,
          typebotVersion: parsedTypebotVersion,
        });
        return parsedTypebotVersion;
      });
    } catch (err) {
      if (!isUniqueConstraintError(err) || attempt === 2) throw err;
    }
  }
  throw new Error("Unable to create typebot version");
};

export const createAndActivateTypebotVersion = async ({
  typebot,
  userId,
}: {
  typebot: SnapshotSource;
  userId: string;
}) => {
  const version = await createAndActivateTypebotVersionInternal({
    typebot,
    userId,
  });
  if (env.PRUNE_TYPEBOT_VERSIONS_LIMIT > 0) {
    // Fire and forget pruning
    pruneTypebotVersions(typebot.id, env.PRUNE_TYPEBOT_VERSIONS_LIMIT).catch(
      console.error,
    );
  }
  return version;
};

const pruneTypebotVersions = async (typebotId: string, limit: number) => {
  const versionsToKeep = await prisma.typebotVersion.findMany({
    where: { typebotId },
    orderBy: { versionNumber: "desc" },
    take: limit,
    select: { id: true },
  });

  const publicTypebot = await prisma.publicTypebot.findUnique({
    where: { typebotId },
    select: { activeVersionId: true },
  });

  const idsToKeep = versionsToKeep.map((v) => v.id);
  if (
    publicTypebot?.activeVersionId &&
    !idsToKeep.includes(publicTypebot.activeVersionId)
  ) {
    idsToKeep.push(publicTypebot.activeVersionId);
  }

  await prisma.typebotVersion.deleteMany({
    where: {
      typebotId,
      id: { notIn: idsToKeep },
    },
  });
};

export const activateTypebotVersion = async ({
  typebotVersion,
}: {
  typebotVersion: TypebotVersion;
}) =>
  prisma.$transaction(async (tx) => {
    await upsertActivePublicTypebot({ tx, typebotVersion });
    return typebotVersion;
  });

const upsertActivePublicTypebot = ({
  tx,
  typebotVersion,
}: {
  tx: Prisma.Prisma.TransactionClient;
  typebotVersion: TypebotVersion;
}) =>
  tx.publicTypebot.upsert({
    where: {
      typebotId: typebotVersion.typebotId,
    },
    create: {
      activeVersionId: typebotVersion.id,
      version: typebotVersion.version,
      typebotId: typebotVersion.typebotId,
      edges: typebotVersion.edges,
      groups: typebotVersion.groups,
      events: typebotVersion.events ?? undefined,
      settings: typebotVersion.settings,
      variables: typebotVersion.variables,
      theme: typebotVersion.theme,
    },
    update: {
      activeVersionId: typebotVersion.id,
      updatedAt: new Date(),
      version: typebotVersion.version,
      edges: typebotVersion.edges,
      groups: typebotVersion.groups,
      events: typebotVersion.events ?? undefined,
      settings: typebotVersion.settings,
      variables: typebotVersion.variables,
      theme: typebotVersion.theme,
    },
  });

const isUniqueConstraintError = (err: unknown) =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === "P2002";
