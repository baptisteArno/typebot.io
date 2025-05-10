import { datesAreOnSameDay } from "@/helpers/datesAreOnSameDate";
import { env } from "@typebot.io/env";
import { getIp } from "@typebot.io/lib/getIp";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { clientUserSchema } from "@typebot.io/schemas/features/user/schema";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import NextAuth from "next-auth";
import { accountHasRequiredOAuthGroups } from "../helpers/accountHasRequiredOAuthGroups";
import { createAuthPrismaAdapter } from "../helpers/createAuthPrismaAdapter";
import { isEmailLegit } from "../helpers/emailValidation";
import { getNewUserInvitations } from "../helpers/getNewUserInvitations";
import { providers } from "./providers";
import rateLimiter from "./rateLimiter";

export const {
  auth,
  handlers: authHandlers,
  signIn,
  signOut,
} = NextAuth((req) => ({
  adapter: createAuthPrismaAdapter(prisma),
  secret: env.ENCRYPTION_SECRET,
  providers,
  trustHost: env.VERCEL_GIT_COMMIT_SHA ? undefined : true,
  pages: {
    signIn: "/signin",
    newUser: env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID ? "/onboarding" : undefined,
    error: "/signin",
  },
  events: {
    session: async ({ session }) => {
      if (!datesAreOnSameDay(session.user.lastActivityAt, new Date())) {
        await prisma.user.updateMany({
          where: { id: session.user.id },
          data: { lastActivityAt: new Date() },
        });
      }
    },
    async signIn({ user, isNewUser }) {
      if (!user.id || isNewUser) return;
      await trackEvents([
        {
          name: "User logged in",
          userId: user.id,
        },
      ]);
    },
    async signOut(props) {
      if ("token" in props) return;
      await trackEvents([
        {
          name: "User logged out",
          userId: (props.session as unknown as { userId: string }).userId,
        },
      ]);
    },
  },
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: clientUserSchema.parse(user),
    }),
    signIn: async ({ account, user, email }) => {
      if (!account) return false;
      const isNewUser = !("createdAt" in user && isDefined(user.createdAt));
      if (user.email && email?.verificationRequest) {
        const ip = req ? getIp(req) : null;
        if (rateLimiter && ip) {
          const { success } = await rateLimiter.limit(ip);
          if (!success) throw new Error("too-many-requests");
        }
        if (!isEmailLegit(user.email)) throw new Error("email-not-legit");
      }
      if (
        env.DISABLE_SIGNUP &&
        isNewUser &&
        user.email &&
        !env.ADMIN_EMAIL?.includes(user.email)
      ) {
        const { invitations, workspaceInvitations } =
          await getNewUserInvitations(prisma, user.email);
        if (invitations.length === 0 && workspaceInvitations.length === 0)
          throw new Error("sign-up-disabled");
      }
      return await accountHasRequiredOAuthGroups(account);
    },
  },
}));
