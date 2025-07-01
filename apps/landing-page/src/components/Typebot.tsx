import { lazy } from "react";

export const Typebot = lazy(() =>
  import("@typebot.io/react").then((m) => ({ default: m.Standard })),
);
