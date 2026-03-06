import { PrismaService } from "@typebot.io/prisma/effect";
import { DbNull, Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import { TypebotId, UserId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { Effect, Schema } from "effect";

export const userId = Schema.decodeSync(UserId)("seedUserId");
export const proWorkspaceId = Schema.decodeSync(WorkspaceId)("proWorkspace");
export const proTypebotId = Schema.decodeSync(TypebotId)("proTypebot");

const latestTypebotVersion = "6.1";
const startEventType = "start";

const sharedTypebotJsonFields = {
  version: latestTypebotVersion,
  groups: [] as object[],
  events: [
    {
      id: "event1",
      type: startEventType,
      graphCoordinates: { x: 0, y: 0 },
      outgoingEdgeId: "edge1",
    },
  ],
  variables: [{ id: "var1", name: "var1" }],
  edges: [
    {
      id: "edge1",
      from: { eventId: "event1" },
      to: { groupId: "group1" },
    },
  ],
  theme: {},
  settings: {},
} as const;

const minimalTypebotData = {
  ...sharedTypebotJsonFields,
  name: "Pro typebot",
  resultsTablePreferences: null as unknown,
};

export const seedDatabaseForTest = Effect.gen(function* () {
  const prisma = yield* PrismaService;

  yield* prisma.user.create({
    data: {
      id: userId,
      email: "test@typebot.io",
      name: "Test User",
      onboardingCategories: [],
    },
  });

  yield* prisma.workspace.create({
    data: {
      id: proWorkspaceId,
      name: "Pro workspace",
      plan: Plan.PRO,
    },
  });

  yield* prisma.memberInWorkspace.create({
    data: {
      userId,
      workspaceId: proWorkspaceId,
      role: WorkspaceRole.ADMIN,
    },
  });

  yield* prisma.typebot.create({
    data: {
      id: proTypebotId,
      workspaceId: proWorkspaceId,
      publicId: `${proTypebotId}-public`,
      ...minimalTypebotData,
      resultsTablePreferences:
        minimalTypebotData.resultsTablePreferences === null
          ? DbNull
          : minimalTypebotData.resultsTablePreferences,
      events: minimalTypebotData.events,
    },
  });

  yield* prisma.publicTypebot.create({
    data: {
      id: `${proTypebotId}-public`,
      typebotId: proTypebotId,
      ...sharedTypebotJsonFields,
      events: sharedTypebotJsonFields.events,
    },
  });

  const emailPropertyDef = yield* prisma.contactPropertyDefinition.create({
    data: {
      key: "email",
      type: "EMAIL",
      isUnique: true,
      workspaceId: proWorkspaceId,
    },
  });

  const contactCount = 75;
  yield* Effect.forEach(
    Array.from({ length: contactCount }, (_, i) => i + 1),
    (index) =>
      prisma.contact.create({
        data: {
          workspaceId: proWorkspaceId,
          name: `Contact ${index}`,
          properties: {
            create: {
              definitionId: emailPropertyDef.id,
              valueString: `contact-${index}@test.local`,
              valueNumber: null,
            },
          },
        },
      }),
    { concurrency: 1 },
  );

  return {
    userId,
    workspaceId: proWorkspaceId,
    proTypebotId,
  } as const;
});
