import css from "@/assets/globals.css?url";
import { NotFound } from "@/components/NotFound";
import { Footer } from "@/components/footer/Footer";
import { TanStackRouterDevtools } from "@/lib/router-dev-tool";
import { Portal } from "@ark-ui/react/portal";
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { Header } from "app/components/Header";
import { Suspense } from "react";

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "stylesheet", href: css }],
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
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <Meta />
        {import.meta.env.DEV && (
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: `import RefreshRuntime from "/_build/@react-refresh";
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type`,
            }}
          />
        )}
      </head>
      <body>
        <div className="flex flex-col items-stretch">
          <Portal>
            <div className="fixed top-4 md:bottom-12 md:top-auto w-full z-10">
              <Header />
            </div>
          </Portal>
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
