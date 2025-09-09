import { env } from "@typebot.io/env";
import { createId, createUUIDv7 } from "@typebot.io/lib/createId";
import { parse, serialize } from "cookie";
import {
  COOKIE_EXPIRATION,
  DEFAULT_COOKIE_DOMAIN,
  SESSION_EXPIRATION,
  TYPEBOT_COOKIE_NAME,
  VISITOR_ID_PREFIX,
} from "./constants";
import { cookieValueSchema, type TypebotCookieValue } from "./schema";

export const getTypebotCookie = (
  cookies: Record<string, string | undefined> | string,
): TypebotCookieValue | null => {
  let stringValue: string | undefined;
  if (typeof cookies === "string") {
    stringValue = parse(cookies)[TYPEBOT_COOKIE_NAME];
  } else {
    stringValue = cookies[TYPEBOT_COOKIE_NAME];
  }
  if (!stringValue) return null;
  const parsedValue = cookieValueSchema.safeParse(
    JSON.parse(decodeURIComponent(stringValue)),
  );
  if (!parsedValue.success) {
    console.warn("Invalid typebot cookie", JSON.parse(stringValue));
    return null;
  }
  return parsedValue.data;
};

export const resetLandingPageCookieSession = (
  cookie: TypebotCookieValue,
): TypebotCookieValue => {
  if (!cookie.landingPage)
    throw new Error("Landing page cookie props are missing");
  return {
    ...cookie,
    landingPage: {
      ...cookie.landingPage,
      session: {
        ...cookie.landingPage.session,
        id: createUUIDv7(),
        createdAt: Date.now(),
      },
    },
  };
};

export const isCookieSessionExpired = (
  cookieSessionCreatedAt: number,
): boolean => cookieSessionCreatedAt + SESSION_EXPIRATION * 1000 <= Date.now();

export const initLandingPageCookieProp = (
  cookie: TypebotCookieValue,
): TypebotCookieValue => {
  return {
    ...cookie,
    landingPage: {
      id: VISITOR_ID_PREFIX + createId(),
      isMerged: false,
      session: { id: createUUIDv7(), createdAt: Date.now() },
    },
  };
};

export const resetCookie = (cookie: TypebotCookieValue): TypebotCookieValue => {
  return {
    ...cookie,
    landingPage: undefined,
  };
};

export const serializeTypebotCookie = (value: TypebotCookieValue): string =>
  serialize(TYPEBOT_COOKIE_NAME, JSON.stringify(value), {
    maxAge: COOKIE_EXPIRATION,
    domain: getCookieDomain(),
    path: "/" as const,
  });

const getCookieDomain = () => {
  if (
    typeof window === "undefined" &&
    env.LANDING_PAGE_URL?.includes("localhost")
  )
    return "localhost";
  return DEFAULT_COOKIE_DOMAIN;
};
