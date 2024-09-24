import type { ChatLog } from "@typebot.io/bot-engine/schemas/api";
import type { ScriptToExecute } from "@typebot.io/bot-engine/schemas/clientSideAction";
import { stringifyError } from "@typebot.io/lib/stringifyError";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

export const executeScript = async ({
  content,
  args,
}: ScriptToExecute): Promise<void | { logs: ChatLog[] }> => {
  try {
    const func = AsyncFunction(
      ...args.map((arg) => arg.id),
      parseContent(content),
    );
    await func(...args.map((arg) => arg.value));
    console.log(parseContent(content));
  } catch (err) {
    console.log(err);
    return {
      logs: [
        {
          status: "error",
          description: "Script block failed to execute",
          details: stringifyError(err),
        },
      ],
    };
  }
};

const parseContent = (content: string) => {
  const contentWithoutScriptTags = content
    .replace(/<script>/g, "")
    .replace(/<\/script>/g, "");
  return contentWithoutScriptTags;
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
    await func(...Object.keys(args).map((key) => args[key]));
  } catch (err) {
    console.warn("Script threw an error:", err);
  }
};
