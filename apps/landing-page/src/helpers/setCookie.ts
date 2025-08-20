import { serializeTypebotCookie } from "@typebot.io/telemetry/cookies/helpers";

export const setCookie = (consent: "declined" | "accepted") => {
  document.cookie = serializeTypebotCookie({
    consent,
  });
};
