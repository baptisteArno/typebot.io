import React from "react";

export const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/react-router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );
