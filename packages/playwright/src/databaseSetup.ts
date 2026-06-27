import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { encrypt } from "@typebot.io/credentials/encrypt";
import type { StripeCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { hashApiToken } from "@typebot.io/lib/apiToken";
import prisma from "@typebot.io/prisma";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import { createTypebots } from "./databaseActions";

export const apiToken = "jirowjgrwGREHE";

const proTypebotId = "proTypebot";
export const proWorkspaceId = "proWorkspace";
export const freeWorkspaceId = "freeWorkspace";
export const starterWorkspaceId = "starterWorkspace";
export const lifetimeWorkspaceId = "lifetimeWorkspaceId";
export const customWorkspaceId = "customWorkspaceId";

const setupWorkspaces = async () => {
  await prisma.workspace.createMany({
    data: [
      {
        id: freeWorkspaceId,
        name: "Free workspace",
        plan: Plan.FREE,
      },
      {
        id: starterWorkspaceId,
        name: "Starter workspace",
        stripeId: "cus_LnPDugJfa18N41",
        plan: Plan.STARTER,
      },
      {
        id: proWorkspaceId,
        name: "Pro workspace",
        plan: Plan.PRO,
      },
      {
        id: lifetimeWorkspaceId,
        name: "Lifetime workspace",
        plan: Plan.LIFETIME,
      },
      {
        id: customWorkspaceId,
        name: "Custom workspace",
        plan: Plan.CUSTOM,
        customChatsLimit: 100000,
        customStorageLimit: 50,
        customSeatsLimit: 20,
      },
    ],
  });
};

export const setupUsers = async () => {
  const authenticatedUser = await prisma.user.findFirst({
    where: {
      email: "baptiste@typebot.io",
    },
  });
  if (!authenticatedUser) {
    throw new Error("Authenticated user not found");
  }
  await setupAuthenticatedUserSession(authenticatedUser.id);
  await prisma.apiToken.createMany({
    data: [
      {
        ownerId: authenticatedUser.id,
        name: "Token 1",
        token: hashApiToken(apiToken),
        createdAt: new Date(2022, 1, 1),
      },
      {
        ownerId: authenticatedUser.id,
        name: "Github",
        token: hashApiToken("jirowjgrwGREHEgdrgithub"),
        createdAt: new Date(2022, 1, 2),
      },
      {
        ownerId: authenticatedUser.id,
        name: "N8n",
        token: hashApiToken("jirowjgrwGREHrgwhrwn8n"),
        createdAt: new Date(2022, 1, 3),
      },
    ],
  });
  return prisma.memberInWorkspace.createMany({
    data: [
      {
        role: WorkspaceRole.ADMIN,
        userId: authenticatedUser.id,
        workspaceId: freeWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId: authenticatedUser.id,
        workspaceId: starterWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId: authenticatedUser.id,
        workspaceId: proWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId: authenticatedUser.id,
        workspaceId: lifetimeWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId: authenticatedUser.id,
        workspaceId: customWorkspaceId,
      },
    ],
  });
};

const setupAuthenticatedUserSession = async (userId: string) => {
  const sessionToken = getPlaywrightAuthSessionToken();
  if (!sessionToken) return;
  await prisma.session.upsert({
    where: {
      sessionToken,
    },
    create: {
      sessionToken,
      userId,
      expires: createSessionExpiryDate(),
    },
    update: {
      userId,
      expires: createSessionExpiryDate(),
    },
  });
};

const getPlaywrightAuthSessionToken = () => {
  const authStatePath = join(process.cwd(), "src/test/.auth/user.json");
  if (!existsSync(authStatePath)) return;
  const authState = JSON.parse(readFileSync(authStatePath, "utf8"));
  if (typeof authState !== "object" || authState === null) return;
  const cookies = Reflect.get(authState, "cookies");
  if (!Array.isArray(cookies)) return;

  for (const cookie of cookies) {
    if (typeof cookie !== "object" || cookie === null) continue;
    const cookieName = Reflect.get(cookie, "name");
    const cookieValue = Reflect.get(cookie, "value");
    if (
      (cookieName === "authjs.session-token" ||
        cookieName === "__Secure-authjs.session-token") &&
      typeof cookieValue === "string"
    )
      return cookieValue;
  }
};

const createSessionExpiryDate = () =>
  new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

const setupCredentials = async () => {
  const { encryptedData, iv } = await encrypt({
    expiry_date: 1642441058842,
    access_token:
      "ya29.A0ARrdaM--PV_87ebjywDJpXKb77NBFJl16meVUapYdfNv6W6ZzqqC47fNaPaRjbDbOIIcp6f49cMaX5ndK9TAFnKwlVqz3nrK9nLKqgyDIhYsIq47smcAIZkK56SWPx3X3DwAFqRu2UPojpd2upWwo-3uJrod",
    // This token is linked to a test Google account (typebot.test.user@gmail.com)
    refresh_token:
      "1//039xWRt8YaYa3CgYIARAAGAMSNwF-L9Iru9FyuTrDSa7lkSceggPho83kJt2J29G69iEhT1C6XV1vmo6bQS9puL_R2t8FIwR3gek",
  });
  const { encryptedData: stripeEncryptedData, iv: stripeIv } = await encrypt({
    test: {
      publicKey: env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      secretKey: env.STRIPE_SECRET_KEY,
    },
    live: {
      publicKey: env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? "",
      secretKey: env.STRIPE_SECRET_KEY ?? "",
    },
  } satisfies StripeCredentials["data"]);
  const { encryptedData: mistralEncryptedData, iv: mistralIv } = await encrypt({
    apiKey: process.env.MISTRAL,
  });
  return prisma.credentials.createMany({
    data: [
      {
        name: "pro-user@email.com",
        type: "google sheets",
        data: encryptedData,
        workspaceId: proWorkspaceId,
        iv,
      },
      {
        id: "stripe",
        name: "Test",
        type: "stripe",
        data: stripeEncryptedData,
        workspaceId: proWorkspaceId,
        iv: stripeIv,
      },
      {
        id: "mistral",
        name: "Mistral",
        type: "mistral",
        data: mistralEncryptedData,
        workspaceId: proWorkspaceId,
        iv: mistralIv,
      },
    ],
  });
};

const setupTypebots = async () => {
  await createTypebots([
    {
      id: proTypebotId,
      name: "Pro typebot",
      workspaceId: proWorkspaceId,
    },
  ]);
};

export const setupDatabase = async () => {
  await setupWorkspaces();
  await setupUsers();
  await setupTypebots();
  await setupCredentials();
};

export const teardownDatabase = async () => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: "baptiste@typebot.io",
    },
  });
  if (!existingUser) {
    console.warn("Authenticated user not found");
    return;
  }
  await prisma.apiToken.deleteMany({
    where: {
      ownerId: existingUser.id,
    },
  });
  await prisma.webhook.deleteMany({
    where: {
      typebot: {
        workspace: {
          members: {
            some: { userId: { in: [existingUser.id] } },
          },
        },
      },
    },
  });
  await prisma.workspace.deleteMany({
    where: {
      members: {
        some: { userId: { in: [existingUser.id] } },
      },
    },
  });
  await prisma.workspace.deleteMany({
    where: {
      id: {
        in: [
          proWorkspaceId,
          freeWorkspaceId,
          starterWorkspaceId,
          lifetimeWorkspaceId,
          customWorkspaceId,
        ],
      },
    },
  });
};
