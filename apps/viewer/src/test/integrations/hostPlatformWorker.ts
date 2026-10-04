import {
  handleStartChat,
  startChatInputSchema,
} from "@typebot.io/bot-engine/api/handleStartChat";
import { POST as continueRoute } from "../../app/api/internal/host/sessions/[sessionId]/continue/route";
import { POST as startRoute } from "../../app/api/internal/host/start/route";

const main = async () => {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk.toString();
  const input = JSON.parse(raw) as {
    mode: "start" | "continue" | "public";
    headers: Record<string, string>;
    body: unknown;
    sessionId?: string;
  };
  const request = new Request("http://localhost/api/internal/host", {
    method: "POST",
    headers: input.headers,
    body: JSON.stringify(input.body),
  });
  if (input.mode === "public") {
    try {
      await handleStartChat({
        input: startChatInputSchema.parse({
          publicId: (input.body as { flowId: string }).flowId,
        }),
        context: {},
      });
      process.stdout.write(JSON.stringify({ status: 200, body: {} }));
    } catch {
      process.stdout.write(JSON.stringify({ status: 403, body: {} }));
    }
    return;
  }
  const response =
    input.mode === "start"
      ? await startRoute(request)
      : await continueRoute(request, {
          params: Promise.resolve({ sessionId: input.sessionId ?? "" }),
        });
  process.stdout.write(
    JSON.stringify({ status: response.status, body: await response.json() }),
  );
};

void main();
