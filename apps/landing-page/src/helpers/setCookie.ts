import { writeBrowserCookie } from "@typebot.io/lib/writeBrowserCookie";
import {
  COOKIE_EXPIRATION,
  DEFAULT_COOKIE_DOMAIN,
  TYPEBOT_COOKIE_NAME,
} from "@typebot.io/telemetry/cookies/constants";

export const setCookie = async (consent: "declined" | "accepted") => {
  await writeBrowserCookie({
    name: TYPEBOT_COOKIE_NAME,
    value: encodeURIComponent(JSON.stringify({ consent })),
    domain: DEFAULT_COOKIE_DOMAIN,
    path: "/",
    expires: Date.now() + COOKIE_EXPIRATION * 1000,
  });
};
