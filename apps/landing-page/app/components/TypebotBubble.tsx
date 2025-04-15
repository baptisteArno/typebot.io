import { lazy } from "react";
import { ClientOnly } from "./ClientOnly";

export const Bubble = lazy(() =>
  import("@typebot.io/react").then((m) => ({ default: m.Bubble })),
);

export const TypebotBubble = () => (
  <ClientOnly fallback={<div className="size-12" />}>
    <Bubble
      typebot="typebot-demo"
      theme={{
        position: "static",
        chatWindow: {
          maxHeight: "400px",
        },
      }}
    />
  </ClientOnly>
);
