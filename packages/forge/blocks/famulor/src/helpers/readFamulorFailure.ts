import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";

export const readFamulorFailure = async ({
  err,
  context,
}: {
  err: unknown;
  context: string;
}) => {
  const parsed = await parseUnknownError({ err, context });
  const apiMessage = readApiMessage(parsed.details);
  if (!apiMessage) return parsed;
  return { ...parsed, description: apiMessage };
};

const readApiMessage = (details: string | undefined) => {
  if (!details) return;
  const body = parseJson(details);
  if (!isRecord(body) || !isRecord(body.error)) return;
  const { message, code } = body.error;
  if (typeof message !== "string" || message === "") return;
  return typeof code === "string" ? `${message} (${code})` : message;
};

const parseJson = (value: string) => {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
