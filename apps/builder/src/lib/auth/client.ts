"use client";

import {
  adminClient,
  emailOTPClient,
  genericOAuthClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    adminClient(),
    genericOAuthClient(),
  ],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
