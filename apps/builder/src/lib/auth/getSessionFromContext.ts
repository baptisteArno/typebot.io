import type { GetServerSidePropsContext } from "next";
import { auth } from "./config";

/**
 * Get session from GetServerSidePropsContext for pages router
 * This converts the request to headers that Better Auth can use
 */
export async function getSessionFromContext(
  context: GetServerSidePropsContext,
) {
  const { req } = context;

  // Build headers from the request
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  return auth.api.getSession({
    headers,
  });
}
