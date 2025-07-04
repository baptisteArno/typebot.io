import css from "@/assets/globals.css?url";
import { CookieConsentBot } from "@/components/CookieConsentBot";
import { Header } from "@/components/Header";
import { NotFound } from "@/components/NotFound";
import { Footer } from "@/components/footer/Footer";
import { useCookieConsentStatus } from "@/hooks/useIsCookieConsentNeeded";
import { useTrackPageViewQuery } from "@/hooks/useTrackPageViewQuery";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useNavigate,
} from "@tanstack/react-router";
import { serializeTypebotCookie } from "@typebot.io/telemetry/cookies/helpers";
import { z } from "@typebot.io/zod";

const HERO_ANIMATION_DELAY = 1800;

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: "stylesheet", href: css },
      {
        rel: "icon",
        type: "images/svg+xml",
        href: "/images/favicon.svg",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Typebot",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  validateSearch: z.object({
    isHeaderOpened: z.boolean().optional(),
  }),
});

function RootComponent() {
  const { isHeaderOpened } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { cookieConsentStatus, setCookieConsentStatus } =
    useCookieConsentStatus();

  const openHeader = () => {
    navigate({
      search: { isHeaderOpened: true },
      resetScroll: false,
    });
  };
  const closeHeader = () => {
    navigate({
      search: { isHeaderOpened: undefined },
      resetScroll: false,
    });
  };

  useTrackPageViewQuery({
    enabled:
      cookieConsentStatus === "not-needed" ||
      cookieConsentStatus === "accepted",
  });

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex flex-col items-stretch">
          <div className="fixed z-10 top-4 md:bottom-12 md:top-auto w-full">
            <Header
              onOpen={openHeader}
              onClose={closeHeader}
              isOpened={isHeaderOpened}
            />
          </div>
          <Outlet />
          <CookieConsentBot
            isOpen={cookieConsentStatus === "need-consent"}
            openDelay={HERO_ANIMATION_DELAY}
            onSubmit={(response) => {
              setCookie(response);
              setCookieConsentStatus(response);
            }}
          />
          <Footer />
        </div>
        <Scripts />
      </body>
    </html>
  );
}

const setCookie = (consent: "declined" | "accepted") => {
  document.cookie = serializeTypebotCookie({
    consent,
  });
};
