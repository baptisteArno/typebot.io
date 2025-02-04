import css from "@/assets/globals.css?url";
import { Header } from "@/components/Header";
import { NotFound } from "@/components/NotFound";
import { Footer } from "@/components/footer/Footer";
import { TanStackRouterDevtools } from "@/lib/router-dev-tool";
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { z } from "@typebot.io/zod";
import { Suspense } from "react";

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

  return (
    <html lang="en">
      <head>
        <Meta />
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
          <Footer />
        </div>
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
