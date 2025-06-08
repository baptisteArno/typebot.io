import { createServerFn } from "@tanstack/react-start";
import {
  getHeaders,
  parseCookies,
  setHeaders,
} from "@tanstack/react-start/server";
import { env } from "@typebot.io/env";
import {
  getTypebotCookie,
  initLandingPageCookieProp,
  isCookieSessionExpired,
  resetLandingPageCookieSession,
  serializeTypebotCookie,
} from "@typebot.io/telemetry/cookies/helpers";
import { isBot } from "@typebot.io/telemetry/isBot";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { z } from "@typebot.io/zod";

export const trackPageViewBodySchema = z.object({
  url: z.string(),
  pathname: z.string(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  device_type: z.enum(["Desktop", "Mobile", "Tablet"]).optional(),
});

export const trackPageView = createServerFn({
  method: "POST",
  response: "raw",
})
  .validator(trackPageViewBodySchema)
  .handler(async (ctx) => {
    if (!env.LANDING_PAGE_URL || !env.NEXT_PUBLIC_POSTHOG_KEY)
      return new Response("NO ENV, SKIPPING...", { status: 200 });

    const headers = getHeaders();

    if (isBot(headers["user-agent"]))
      return new Response("BOT, SKIPPING...", { status: 200 });

    let typebotCookie = getTypebotCookie(parseCookies());

    if (!typebotCookie || typebotCookie.consent === "declined")
      return new Response("NO COOKIE SKIPPING...", { status: 200 });

    if (!typebotCookie.landingPage) {
      typebotCookie = initLandingPageCookieProp(typebotCookie);
    } else if (
      isCookieSessionExpired(typebotCookie.landingPage.session.createdAt)
    ) {
      typebotCookie = resetLandingPageCookieSession(typebotCookie);
    }

    if (!typebotCookie.landingPage)
      throw new Error("Landing page cookie props are missing");

    await trackEvents([
      {
        name: "$pageview",
        visitorId: typebotCookie.landingPage.id,
        data: {
          $session_id: typebotCookie.landingPage.session.id,
          $current_url: ctx.data.url,
          $pathname: ctx.data.pathname,
          $referrer: ctx.data.referrer,
          $referring_domain: (() => {
            if (!ctx.data.referrer) return "$direct";
            try {
              return new URL(ctx.data.referrer).hostname;
            } catch {
              return "$direct";
            }
          })(),
          $process_person_profile: false,
          $utm_source: ctx.data.utm_source,
          $utm_medium: ctx.data.utm_medium,
          $utm_campaign: ctx.data.utm_campaign,
          $device_type: ctx.data.device_type,
        },
      },
    ]);

    setHeaders({
      "Set-Cookie": serializeTypebotCookie(typebotCookie),
    });

    return new Response("OK", { status: 200 });
  });
