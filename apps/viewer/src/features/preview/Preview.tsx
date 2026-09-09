import {
  maxPreviewLogBatchSize,
  previewHostMessageSchema,
} from "@typebot.io/chat-api/previewMessages";
import type { StartChatResponse } from "@typebot.io/chat-api/schemas";
import { env } from "@typebot.io/env";
import { Standard } from "@typebot.io/react";
import type { Settings } from "@typebot.io/settings/schemas";
import type { Theme } from "@typebot.io/theme/schemas";
import { useEffect, useState } from "react";

export const Preview = () => {
  const [documentId] = useState(() => crypto.randomUUID());
  const [initialChatReply, setInitialChatReply] = useState<StartChatResponse>();
  const [previewTheme, setPreviewTheme] = useState<Theme>();
  const [previewSettings, setPreviewSettings] = useState<Settings>();
  const builderOrigin = env.NEXT_PUBLIC_BUILDER_ORIGIN;

  useEffect(() => {
    // This page never authenticates as the builder user and cannot ask the
    // parent to proxy arbitrary requests. Only presentation events go back.
    if (
      !builderOrigin ||
      window.parent === window ||
      window.location.origin === builderOrigin
    )
      return;
    let initialized = false;
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== window.parent || event.origin !== builderOrigin)
        return;
      const message = previewHostMessageSchema.safeParse(event.data);
      if (!message.success || message.data.documentId !== documentId) return;
      if (message.data.type === "typebot-preview:init") {
        if (initialized) return;
        initialized = true;
        setInitialChatReply(message.data.initialChatReply);
      }
      setPreviewTheme(message.data.previewTheme);
      setPreviewSettings(message.data.previewSettings);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage(
      { type: "typebot-preview:ready", documentId },
      builderOrigin,
    );
    return () => window.removeEventListener("message", onMessage);
  }, [builderOrigin, documentId]);

  if (!initialChatReply || !builderOrigin) return null;
  return (
    <Standard
      typebot={initialChatReply.typebot.id}
      initialChatReply={initialChatReply}
      isPreview
      previewTheme={previewTheme}
      previewSettings={previewSettings}
      apiHost={window.location.origin}
      style={{ width: "100%", height: "100dvh" }}
      onNewInputBlock={(block) =>
        window.parent.postMessage(
          { type: "typebot-preview:input", documentId, blockId: block.id },
          builderOrigin,
        )
      }
      onNewLogs={(logs) => {
        for (
          let start = 0;
          start < logs.length;
          start += maxPreviewLogBatchSize
        )
          window.parent.postMessage(
            {
              type: "typebot-preview:logs",
              documentId,
              logs: logs.slice(start, start + maxPreviewLogBatchSize),
            },
            builderOrigin,
          );
      }}
    />
  );
};
