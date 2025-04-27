import type { ScriptToExecute } from "@typebot.io/chat-api/clientSideAction";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import type { LogInSession } from "@typebot.io/logs/schemas";

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

export const executeSetVariable = async ({
  content,
  args,
  isCode,
}: ScriptToExecute): Promise<{
  replyToSend: string | undefined;
  logs?: LogInSession[];
}> => {
  try {
    // To avoid octal number evaluation
    if (!isNaN(content as unknown as number) && /0[^.].+/.test(content))
      return {
        replyToSend: content,
      };
    const func = AsyncFunction(
      ...args.map((arg) => arg.id),
      content.includes("return ") ? content : `return ${content}`,
    );
    const replyToSend = await func(...args.map((arg) => arg.value));
    return {
      replyToSend: safeStringify(replyToSend) ?? undefined,
    };
  } catch (err) {
    console.error(err);
    return {
      replyToSend: safeStringify(content) ?? undefined,
      logs: isCode
        ? [
            await parseUnknownClientError({
              err,
              context: "While executing set variable",
            }),
          ]
        : undefined,
    };
  }
};
