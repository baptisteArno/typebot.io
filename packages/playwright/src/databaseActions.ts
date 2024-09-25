import { readFileSync } from "fs";
import { createId } from "@typebot.io/lib/createId";
import prisma from "@typebot.io/prisma";
import { DbNull, Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import type { User } from "@typebot.io/schemas/features/user/schema";
import type { Typebot, TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import {
  parseTestTypebot,
  parseTypebotToPublicTypebot,
} from "./databaseHelpers";
import { proWorkspaceId, userId } from "./databaseSetup";

type CreateFakeResultsProps = {
  typebotId: string;
  count: number;
  customResultIdPrefix?: string;
  isChronological?: boolean;
};

export const injectFakeResults = async ({
  count,
  customResultIdPrefix,
  typebotId,
  isChronological,
}: CreateFakeResultsProps) => {
  const resultIdPrefix = customResultIdPrefix ?? createId();
  await prisma.result.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => {
        const today = new Date();
        const rand = Math.random();
        return {
          id: `${resultIdPrefix}-result${idx}`,
          typebotId,
          createdAt: isChronological
            ? new Date(
                today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx),
              )
            : new Date(),
          isCompleted: rand > 0.5,
          hasStarted: true,
          variables: [],
        } satisfies Prisma.Prisma.ResultCreateManyInput;
      }),
    ],
  });
  return createAnswers({ resultIdPrefix, count });
};

const createAnswers = ({
  count,
  resultIdPrefix,
}: { resultIdPrefix: string } & Pick<CreateFakeResultsProps, "count">) => {
  return prisma.answerV2.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => ({
        resultId: `${resultIdPrefix}-result${idx}`,
        content: `content${idx}`,
        blockId: "block1",
      })),
    ],
  });
};

export const importTypebotInDatabase = async (
  path: string,
  updates?: Partial<Typebot>,
) => {
  const typebotFile = JSON.parse(readFileSync(path).toString());
  const typebot = {
    events: null,
    ...typebotFile,
    workspaceId: proWorkspaceId,
    ...updates,
  };
  await prisma.typebot.create({
    data: parseCreateTypebot(typebot),
  });
  return prisma.publicTypebot.create({
    data: {
      ...parseTypebotToPublicTypebot(
        updates?.id ? `${updates?.id}-public` : "publicBot",
        typebot,
      ),
      events: typebot.events === null ? DbNull : typebot.events,
    },
  });
};

export const deleteWorkspaces = async (workspaceIds: string[]) => {
  await prisma.workspace.deleteMany({
    where: { id: { in: workspaceIds } },
  });
};

export const deleteTypebots = async (typebotIds: string[]) => {
  await prisma.typebot.deleteMany({
    where: { id: { in: typebotIds } },
  });
};

export const deleteCredentials = async (credentialIds: string[]) => {
  await prisma.credentials.deleteMany({
    where: { id: { in: credentialIds } },
  });
};

export const deleteWebhooks = async (webhookIds: string[]) => {
  await prisma.webhook.deleteMany({
    where: { id: { in: webhookIds } },
  });
};

export const createWorkspaces = async (workspaces: Partial<Workspace>[]) => {
  const workspaceIds = workspaces.map(
    (workspace) => workspace.id ?? createId(),
  );
  await prisma.workspace.createMany({
    data: workspaces.map((workspace, index) => ({
      id: workspaceIds[index],
      name: "Free workspace",
      plan: Plan.FREE,
      ...workspace,
    })),
  });
  await prisma.memberInWorkspace.createMany({
    data: workspaces.map((_, index) => ({
      userId,
      workspaceId: workspaceIds[index]!,
      role: WorkspaceRole.ADMIN,
    })),
  });
  return workspaceIds;
};

export const updateUser = (data: Partial<User>) =>
  prisma.user.update({
    data: {
      ...data,
      onboardingCategories: data.onboardingCategories ?? [],
      displayedInAppNotifications: data.displayedInAppNotifications ?? DbNull,
    },
    where: {
      id: userId,
    },
  });

export const createTypebots = async (partialTypebots: Partial<TypebotV6>[]) => {
  const typebotsWithId = partialTypebots.map((typebot) => {
    const typebotId = typebot.id ?? createId();
    return {
      ...typebot,
      id: typebotId,
      publicId: typebot.publicId ?? typebotId + "-public",
    };
  });
  await prisma.typebot.createMany({
    data: typebotsWithId.map(parseTestTypebot).map(parseCreateTypebot),
  });
  return prisma.publicTypebot.createMany({
    data: typebotsWithId.map((t) => ({
      ...parseTypebotToPublicTypebot(t.publicId, parseTestTypebot(t)),
    })) as any,
  });
};

export const updateTypebot = async (
  partialTypebot: Partial<Typebot> & { id: string },
) => {
  await prisma.typebot.updateMany({
    where: { id: partialTypebot.id },
    data: parseUpdateTypebot(partialTypebot),
  });
  return prisma.publicTypebot.updateMany({
    where: { typebotId: partialTypebot.id },
    data: {
      ...partialTypebot,
      events: partialTypebot.events === null ? DbNull : partialTypebot.events,
    },
  });
};

export const updateWorkspace = async (
  id: string,
  data: Prisma.Prisma.WorkspaceUncheckedUpdateManyInput,
) => {
  await prisma.workspace.updateMany({
    where: { id: proWorkspaceId },
    data,
  });
};

export const parseCreateTypebot = (typebot: Typebot) => ({
  ...typebot,
  resultsTablePreferences:
    typebot.resultsTablePreferences === null
      ? DbNull
      : typebot.resultsTablePreferences,
  events: typebot.events === null ? DbNull : typebot.events,
});

const parseUpdateTypebot = (typebot: Partial<Typebot>) => ({
  ...typebot,
  resultsTablePreferences:
    typebot.resultsTablePreferences === null
      ? DbNull
      : typebot.resultsTablePreferences,
  events: typebot.events === null ? DbNull : typebot.events,
});
