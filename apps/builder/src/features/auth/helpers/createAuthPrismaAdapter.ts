import { convertInvitationsToCollaborations } from "@/features/auth/helpers/convertInvitationsToCollaborations";
import { getNewUserInvitations } from "@/features/auth/helpers/getNewUserInvitations";
import { joinWorkspaces } from "@/features/auth/helpers/joinWorkspaces";
import { parseWorkspaceDefaultPlan } from "@/features/workspace/helpers/parseWorkspaceDefaultPlan";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters";
import { createId } from "@paralleldrive/cuid2";
import { env } from "@typebot.io/env";
import {
  PrismaClientKnownRequestError,
  WorkspaceRole,
} from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import type { TelemetryEvent } from "@typebot.io/telemetry/schemas";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { userSchema } from "@typebot.io/user/schemas";
import ky from "ky";

export const createAuthPrismaAdapter = (p: Prisma.PrismaClient): Adapter => ({
  createUser: async (data) => {
    if (!data.email)
      throw Error("Provider did not forward email but it is required");
    const user = { id: createId(), email: data.email };
    const { invitations, workspaceInvitations } = await getNewUserInvitations(
      p,
      user.email,
    );
    if (
      env.DISABLE_SIGNUP &&
      env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
      invitations.length === 0 &&
      workspaceInvitations.length === 0
    )
      throw Error("New users are forbidden");

    const newWorkspaceData = {
      name: data.name ? `${data.name}'s workspace` : `My workspace`,
      plan: parseWorkspaceDefaultPlan(data.email),
    };
    const createdUser = await p.user.create({
      data: {
        ...data,
        id: user.id,
        workspaces:
          workspaceInvitations.length > 0
            ? undefined
            : {
                create: {
                  role: WorkspaceRole.ADMIN,
                  workspace: {
                    create: newWorkspaceData,
                  },
                },
              },
        onboardingCategories: [],
      },
      include: {
        workspaces: { select: { workspaceId: true } },
      },
    });
    const newWorkspaceId = createdUser.workspaces.pop()?.workspaceId;
    const events: TelemetryEvent[] = [];
    if (newWorkspaceId) {
      events.push({
        name: "Workspace created",
        workspaceId: newWorkspaceId,
        userId: createdUser.id,
      });
    }
    events.push({
      name: "User created",
      userId: createdUser.id,
    });
    if (env.USER_CREATED_WEBHOOK_URL) {
      try {
        await ky.post(env.USER_CREATED_WEBHOOK_URL, {
          json: {
            email: createdUser.email,
          },
        });
      } catch (e) {
        console.error("Failed to call user created webhook", e);
      }
    }
    await trackEvents(events);
    if (invitations.length > 0)
      await convertInvitationsToCollaborations(p, user, invitations);
    if (workspaceInvitations.length > 0)
      await joinWorkspaces(p, user, workspaceInvitations);
    return createdUser as AdapterUser;
  },
  getUser: async (id) =>
    userSchema.parse(await p.user.findUnique({ where: { id } })),
  getUserByEmail: async (email) => {
    const user = await p.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return userSchema.parse(user);
  },
  async getUserByAccount(provider_providerAccountId) {
    const account = await p.account.findUnique({
      where: { provider_providerAccountId },
      include: { user: true },
    });
    return (account?.user as AdapterUser) ?? null;
  },
  updateUser: ({ id, ...data }) =>
    p.user.update({
      where: { id },
      ...stripUndefined(data),
    }) as Promise<AdapterUser>,
  deleteUser: (id) => p.user.delete({ where: { id } }) as Promise<AdapterUser>,
  linkAccount: (data) =>
    p.account.create({
      data: {
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state as string | undefined,
        oauth_token_secret: data.oauth_token_secret as string,
        oauth_token: data.oauth_token as string,
        refresh_token_expires_in: data.refresh_token_expires_in as
          | number
          | undefined,
      },
    }) as unknown as AdapterAccount,
  unlinkAccount: (provider_providerAccountId) =>
    p.account.delete({
      where: { provider_providerAccountId },
    }) as unknown as AdapterAccount,
  async getSessionAndUser(sessionToken) {
    const userAndSession = await p.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    if (!userAndSession) return null;
    const { user, ...session } = userAndSession;
    return { user, session } as {
      user: AdapterUser;
      session: AdapterSession;
    };
  },
  createSession: (data) => p.session.create(stripUndefined(data)),
  updateSession: (data) =>
    p.session.update({
      where: { sessionToken: data.sessionToken },
      ...stripUndefined(data),
    }),
  deleteSession: (sessionToken) =>
    p.session.delete({ where: { sessionToken } }),
  async createVerificationToken(data) {
    const verificationToken = await p.verificationToken.create(
      stripUndefined(data),
    );
    if ("id" in verificationToken && verificationToken.id) {
      const { id, ...rest } = verificationToken;
      return rest;
    }
    return verificationToken;
  },
  async useVerificationToken(identifier_token) {
    try {
      const verificationToken = await p.verificationToken.delete({
        where: { identifier_token },
      });
      if ("id" in verificationToken && verificationToken.id) {
        const { id, ...rest } = verificationToken;
        return rest;
      }
      return verificationToken;
    } catch (error: unknown) {
      // If token already used/deleted
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      )
        return null;
      throw error;
    }
  },
  async getAccount(providerAccountId, provider) {
    return p.account.findFirst({
      where: { providerAccountId, provider },
    }) as Promise<AdapterAccount | null>;
  },
});

/** @see https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/null-and-undefined */
function stripUndefined<T>(obj: T) {
  const data = {} as T;
  for (const key in obj) if (obj[key] !== undefined) data[key] = obj[key];
  return { data };
}
