import React from "react";

const LazyTanStackRouterDevtools = React.lazy(() =>
  import("@tanstack/react-router-devtools").then((res) => ({
    default: res.TanStackRouterDevtools,
  })),
);

export const TanStackRouterDevtools: () => React.ReactNode = () => {
  if (process.env.NODE_ENV === "production") return null;
  return React.createElement(LazyTanStackRouterDevtools);
};
