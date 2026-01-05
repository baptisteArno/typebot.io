import { env } from "@typebot.io/env";
import { datesAreOnSameDay } from "@typebot.io/lib/datesAreOnSameDay";
import { getIp } from "@typebot.io/lib/getIp";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import {
  getTypebotCookie,
  serializeTypebotCookie,
} from "@typebot.io/telemetry/cookies/helpers";
import type { TypebotCookieValue } from "@typebot.io/telemetry/cookies/schema";
import { mergeIds } from "@typebot.io/telemetry/mergeIds";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { clientUserSchema } from "@typebot.io/user/schemas";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { accountHasRequiredOAuthGroups } from "../helpers/accountHasRequiredOAuthGroups";
import { createAuthPrismaAdapter } from "../helpers/createAuthPrismaAdapter";
import { isEmailLegit } from "../helpers/emailValidation";
import { getNewUserInvitations } from "../helpers/getNewUserInvitations";
import oneMinRateLimiter from "./oneMinRateLimiter";
import { providers } from "./providers";

export const SET_TYPEBOT_COOKIE_HEADER = "Set-Typebot-Cookie" as const;

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
      const typebotCookie = getTypebotCookieFromNextReq(req);
      if (typebotCookie) {
        if (
          typebotCookie?.landingPage?.id &&
          !typebotCookie.landingPage.isMerged
        ) {
          await mergeIds({
            visitorId: typebotCookie.landingPage.id,
            userId: session.user.id,
          });
          updateCookieIsMerged({ req, typebotCookie });
        }
      }
    },
    async signIn({ user, isNewUser, account }) {
      if (!user.id) return;
      const typebotCookie = getTypebotCookieFromNextReq(req);
      if (typebotCookie && account?.provider)
        updateCookieLastProvider(account.provider, { req, typebotCookie });
      if (isNewUser) return;
      await trackEvents([
        {
          name: "User logged in",
          userId: user.id,
        },
      ]);
    },
    async signOut(props) {
      if ("token" in props) return;
      const typebotCookie = getTypebotCookieFromNextReq(req);
      if (typebotCookie) resetLandingPageCookie({ req, typebotCookie });
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
        const ip = req
          ? getIp({
              "x-forwarded-for": req.headers.get("x-forwarded-for"),
              "cf-connecting-ip": req.headers.get("cf-connecting-ip"),
            })
          : null;
        if (oneMinRateLimiter && ip) {
          const { success } = await oneMinRateLimiter.limit(ip);
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

const updateCookieIsMerged = ({
  req,
  typebotCookie,
}: {
  req: NextRequest | undefined;
  typebotCookie: TypebotCookieValue;
}) => {
  if (!isValidNextRequest(req) || !typebotCookie.landingPage) return;
  req.headers.set(
    SET_TYPEBOT_COOKIE_HEADER,
    serializeTypebotCookie({
      ...typebotCookie,
      landingPage: {
        ...typebotCookie.landingPage,
        isMerged: true,
      },
    }),
  );
};

const updateCookieLastProvider = (
  provider: string,
  {
    req,
    typebotCookie,
  }: { req: NextRequest | undefined; typebotCookie: TypebotCookieValue },
) => {
  if (!isValidNextRequest(req)) return;
  req.headers.set(
    SET_TYPEBOT_COOKIE_HEADER,
    serializeTypebotCookie({
      ...typebotCookie,
      lastProvider: provider,
    }),
  );
};

const resetLandingPageCookie = ({
  req,
  typebotCookie,
}: {
  req: NextRequest | undefined;
  typebotCookie: TypebotCookieValue;
}) => {
  if (!isValidNextRequest(req)) return;
  req.headers.set(
    SET_TYPEBOT_COOKIE_HEADER,
    serializeTypebotCookie({
      ...typebotCookie,
      lastProvider: undefined,
      landingPage: undefined,
    }),
  );
};

const getTypebotCookieFromNextReq = (
  req: NextRequest | undefined,
): TypebotCookieValue | null => {
  if (!isValidNextRequest(req)) return null;
  const cookieStr = req.headers.get("cookie");
  if (!cookieStr) return null;
  return getTypebotCookie(cookieStr);
};

// Nextauth req type is not correct, so we need to assert it
const isValidNextRequest = (
  req: NextRequest | undefined,
): req is NextRequest => {
  return Boolean(req && "headers" in req && "get" in req.headers);
};
