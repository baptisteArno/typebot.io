import { processDataStream } from "@ai-sdk/ui-utils";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import { createUniqueId } from "solid-js";
import type { ClientSideActionContext } from "@/types";
import { guessApiHost } from "@/utils/guessApiHost";

let abortController: AbortController | null = null;
const secondsToWaitBeforeRetries = 3;
const maxRetryAttempts = 1;

export const streamChat =
  (context: ClientSideActionContext & { retryAttempt?: number }) =>
  async ({
    messages,
    onMessageStream,
    onError,
  }: {
    messages?: {
      content?: string | undefined;
      role?: "system" | "user" | "assistant" | undefined;
    }[];
    onMessageStream?: (props: { id: string; message: string }) => void;
    onError?: (error: LogInSession) => void;
  }): Promise<{ message?: string; error?: LogInSession }> => {
    try {
      abortController = new AbortController();

      const apiHost = context.apiHost;

      const res = await fetch(
        (isNotEmpty(apiHost) ? apiHost : guessApiHost()) +
          `/api/v2/sessions/${context.sessionId}/streamMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
          }),
          signal: abortController.signal,
        },
      );

      if (!res.ok) {
        if (
          (context.retryAttempt ?? 0) < maxRetryAttempts &&
          (res.status === 403 || res.status === 500 || res.status === 503)
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, secondsToWaitBeforeRetries * 1000),
          );
          return streamChat({
            ...context,
            retryAttempt: (context.retryAttempt ?? 0) + 1,
          })({ messages, onMessageStream });
        }
        return {
          error: {
            description: "Failed to fetch chat streaming",
            details: await res.text(),
            context: "While streaming chat",
          },
        };
      }

      if (!res.body) {
        return {
          error: {
            description: "The chat stream response body is empty",
          },
        };
      }

      let message = "";

      const id = createUniqueId();

      await processDataStream({
        stream: res.body,
        onTextPart: async (text) => {
          message += text;
          if (onMessageStream) onMessageStream({ id, message });
        },
        onErrorPart: (error) => {
          onError?.(JSON.parse(error) as LogInSession);
        },
      });

      abortController = null;

      return { message };
    } catch (err) {
      console.error(err);
      // Ignore abort errors as they are expected.
      if ((err as any).name === "AbortError") {
        abortController = null;
        return { error: { description: "Request aborted" } };
      }
      return {
        error: await parseUnknownClientError({
          err,
          context: "While streaming chat",
        }),
      };
    }
  };
