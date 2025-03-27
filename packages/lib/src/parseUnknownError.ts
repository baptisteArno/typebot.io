import * as Sentry from "@sentry/nextjs";

type Props = {
  context?: string;
  err: unknown;
};

export const parseUnknownError = async ({
  err,
  context,
}: Props): Promise<{
  context?: string;
  description: string;
  details?: string;
}> => {
  try {
    if (typeof err === "string")
      return {
        context,
        description: err,
        details: undefined,
      };
    if (err instanceof Error) {
      return {
        context,
        description: err.message,
        details: await extractDetails(err),
      };
    }
    return {
      context,
      description: JSON.stringify(err),
    };
  } catch (err) {
    Sentry.captureException(err);
    return {
      context,
      description: "Unknown error (failed to parse)",
    };
  }
};

export const parseUnknownErrorSync = ({
  err,
  context,
}: Props): {
  context?: string;
  description: string;
  details?: string;
} => {
  try {
    if (typeof err === "string")
      return {
        context,
        description: err,
        details: undefined,
      };
    if (err instanceof Error) {
      return {
        context,
        description: err.message,
        details: extractDetailsSync(err),
      };
    }
    return {
      context,
      description: JSON.stringify(err),
    };
  } catch (err) {
    Sentry.captureException(err);
    return {
      context,
      description: "Unknown error (failed to parse)",
    };
  }
};

const extractDetailsSync = (err: Error): string => {
  if ("responseBody" in err) {
    return typeof err.responseBody === "string"
      ? err.responseBody
      : JSON.stringify(err.responseBody);
  }
  return typeof err.cause === "string" ? err.cause : JSON.stringify(err.cause);
};

const extractDetails = async (err: Error): Promise<string> => {
  if ("responseBody" in err) {
    return typeof err.responseBody === "string"
      ? err.responseBody
      : JSON.stringify(err.responseBody);
  }
  if (
    "response" in err &&
    typeof err.response === "object" &&
    err.response &&
    "text" in err.response &&
    typeof err.response.text === "function"
  ) {
    return await (err.response as Response).text();
  }
  return typeof err.cause === "string" ? err.cause : JSON.stringify(err.cause);
};
