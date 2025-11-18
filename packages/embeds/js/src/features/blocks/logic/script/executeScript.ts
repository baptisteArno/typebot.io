import type { ScriptToExecute } from "@typebot.io/chat-api/clientSideAction";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import type { ClientSideActionContext } from "@/types";
import { runUserCodeInWorker } from "./scriptRunner";

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

export const executeScript = async (
  { content, args, isUnsafe }: ScriptToExecute,
  { isPreview }: Pick<ClientSideActionContext, "isPreview">,
) => {
  try {
    const code = content.replace(/<script>/g, "").replace(/<\/script>/g, "");
    if (isPreview && isUnsafe) {
      const argsRecord = Object.fromEntries(args.map((a) => [a.id, a.value]));

      const result = await runUserCodeInWorker(code, argsRecord);

      if (result && typeof result === "string") {
        return { scriptCallbackMessage: result };
      }
    } else {
      const func = AsyncFunction(...args.map((arg) => arg.id), code);
      const result = await func(...args.map((arg) => arg.value));
      if (result && typeof result === "string")
        return {
          scriptCallbackMessage: result,
        };
    }
  } catch (err) {
    console.log(err);
    return {
      logs: [
        await parseUnknownClientError({
          err,
          context: "While executing script",
        }),
      ],
    };
  }
};

export const executeCode = async ({
  args,
  content,
}: {
  content: string;
  args: Record<string, unknown>;
}) => {
  try {
    const func = AsyncFunction(...Object.keys(args), content);
    const result = await func(...Object.keys(args).map((key) => args[key]));
    if (result && typeof result === "string")
      return {
        scriptCallbackMessage: result,
      };
  } catch (err) {
    console.warn("Script threw an error:", err);
  }
};
