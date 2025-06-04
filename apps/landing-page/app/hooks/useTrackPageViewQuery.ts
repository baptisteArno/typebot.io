import {
  trackPageView,
  type trackPageViewBodySchema,
} from "@/features/telemetry/server/trackPageView";
import { useRouter } from "@tanstack/react-router";
import type { z } from "@typebot.io/zod";
import { useEffect } from "react";

type Props = {
  enabled?: boolean;
};
export const useTrackPageViewQuery = ({ enabled }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    trackPageView({
      data: getPageViewBodyProps(),
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const routerSub = router.subscribe("onLoad", (event) => {
      if (event.pathChanged)
        trackPageView({
          data: getPageViewBodyProps(),
        });
    });

    return () => {
      routerSub();
    };
  }, [enabled, router]);
};

const getPageViewBodyProps = () => {
  if (typeof window === "undefined")
    throw new Error("getPageViewBodyProps can only be called in the browser");
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source:
      new URLSearchParams(window.location.search).get("utm_source") ??
      undefined,
    utm_medium:
      new URLSearchParams(window.location.search).get("utm_medium") ??
      undefined,
    utm_campaign:
      new URLSearchParams(window.location.search).get("utm_campaign") ??
      undefined,
  } satisfies z.infer<typeof trackPageViewBodySchema>;
};
