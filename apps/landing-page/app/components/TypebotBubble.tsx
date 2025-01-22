import { Suspense, lazy } from "react";

export const Bubble = lazy(() =>
  import("@typebot.io/react").then((m) => ({ default: m.Bubble })),
);

export const TypebotBubble = () => (
  <Suspense fallback={<div className="size-12" />}>
    <Bubble
      typebot="typebot-demo"
      theme={{
        position: "static",
        chatWindow: {
          maxHeight: "400px",
        },
      }}
    />
  </Suspense>
);
