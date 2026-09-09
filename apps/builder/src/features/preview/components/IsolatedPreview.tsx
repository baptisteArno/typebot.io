import { previewFrameMessageSchema } from "@typebot.io/chat-api/previewMessages";
import {
  type ContinueChatResponse,
  type StartFrom,
  startChatResponseSchema,
} from "@typebot.io/chat-api/schemas";
import { env } from "@typebot.io/env";
import type { Settings } from "@typebot.io/settings/schemas";
import type { Theme } from "@typebot.io/theme/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { type CSSProperties, useEffect, useRef, useState } from "react";

export const IsolatedPreview = ({
  typebot,
  templateSlug,
  startFrom,
  previewTheme,
  previewSettings,
  style,
  onNewInputBlock,
  onNewLogs,
}: {
  typebot?: string;
  templateSlug?: string;
  startFrom?: StartFrom;
  previewTheme?: Theme;
  previewSettings?: Settings;
  style?: CSSProperties;
  onNewInputBlock?: (block: { id: string }) => void;
  onNewLogs?: (logs: ContinueChatResponse["logs"]) => void;
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const callbacks = useRef({ onNewInputBlock, onNewLogs });
  const appearance = useRef({ previewTheme, previewSettings });
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [readyDocumentId, setReadyDocumentId] = useState<string>();
  callbacks.current = { onNewInputBlock, onNewLogs };
  appearance.current = { previewTheme, previewSettings };
  const previewUrl = new URL("/__preview", env.NEXT_PUBLIC_VIEWER_URL[0]);
  const previewOrigin = previewUrl.origin;
  const startFromKey = JSON.stringify(startFrom);
  const isProgressBarEnabled = previewTheme?.general?.progressBar?.isEnabled;

  useEffect(() => {
    setReadyDocumentId(undefined);
    setError(undefined);
    if (
      previewOrigin === window.location.origin ||
      new URL(previewOrigin).hostname === window.location.hostname
    ) {
      setError(
        "Preview requires a viewer on a different hostname from the builder.",
      );
      return;
    }
    let currentRequest: AbortController | undefined;
    let currentDocumentId: string | undefined;
    const timeout = setTimeout(() => {
      setError(
        "The preview could not connect. Check the viewer URL and its frame policy.",
      );
    }, 20_000);
    const onMessage = async (event: MessageEvent<unknown>) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== previewOrigin
      )
        return;
      const message = previewFrameMessageSchema.safeParse(event.data);
      if (!message.success) return;
      if (message.data.type === "typebot-preview:input") {
        if (message.data.documentId !== currentDocumentId) return;
        callbacks.current.onNewInputBlock?.({ id: message.data.blockId });
        return;
      }
      if (message.data.type === "typebot-preview:logs") {
        if (message.data.documentId !== currentDocumentId) return;
        callbacks.current.onNewLogs?.(message.data.logs);
        return;
      }
      if (message.data.documentId === currentDocumentId) return;
      // The frame connected. Server-side blocks may legitimately take longer.
      clearTimeout(timeout);
      currentRequest?.abort();
      const controller = new AbortController();
      currentRequest = controller;
      currentDocumentId = message.data.documentId;
      setReadyDocumentId(undefined);
      setError(undefined);
      try {
        const response = await fetch(
          templateSlug
            ? `/api/v1/templates/${encodeURIComponent(templateSlug)}/preview/startChat`
            : `/api/v1/typebots/${encodeURIComponent(typebot ?? "")}/preview/startChat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            signal: controller.signal,
            body: JSON.stringify({
              isStreamEnabled: true,
              isProgressBarEnabled,
              startFrom: JSON.parse(startFromKey ?? "null") ?? undefined,
            }),
          },
        );
        if (!response.ok) throw new Error("Could not start preview.");
        const initialChatReply = startChatResponseSchema.parse(
          await response.json(),
        );
        if (controller.signal.aborted) return;
        // No account token, deterministic user session ID, or full bot is sent.
        frame.current?.contentWindow?.postMessage(
          {
            type: "typebot-preview:init",
            documentId: message.data.documentId,
            initialChatReply,
            ...appearance.current,
          },
          previewOrigin,
        );
        setReadyDocumentId(message.data.documentId);
      } catch (error) {
        if (controller.signal.aborted) return;
        clearTimeout(timeout);
        setError(
          error instanceof Error ? error.message : "Could not start preview.",
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      currentRequest?.abort();
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
    };
  }, [
    previewOrigin,
    typebot,
    templateSlug,
    startFromKey,
    isProgressBarEnabled,
    attempt,
  ]);

  useEffect(() => {
    if (!readyDocumentId) return;
    frame.current?.contentWindow?.postMessage(
      {
        type: "typebot-preview:appearance",
        documentId: readyDocumentId,
        previewTheme,
        previewSettings,
      },
      previewOrigin,
    );
  }, [readyDocumentId, previewOrigin, previewTheme, previewSettings]);

  return (
    <div className="flex flex-1 flex-col h-full w-full min-w-0" style={style}>
      {error ? (
        <div role="alert" className="flex flex-col gap-2 p-4">
          <p>{error}</p>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Retry preview
          </Button>
        </div>
      ) : null}
      <iframe
        key={`${typebot ?? templateSlug}-${startFromKey}-${isProgressBarEnabled}-${attempt}`}
        ref={frame}
        title="Bot preview"
        src={previewUrl.href}
        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
        allow="microphone; camera; clipboard-write"
        referrerPolicy="no-referrer"
        className="flex-1 w-full min-h-0 border-0 rounded-[inherit]"
        hidden={Boolean(error)}
      />
    </div>
  );
};
