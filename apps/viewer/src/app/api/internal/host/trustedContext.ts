import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  HostExecutionContextEnvelope,
  TrustedHostExecutionContext,
} from "@typebot.io/runtime-session-store/hostExecutionContext";

export const equal = (actual: string | null, expected: string | undefined) =>
  !!actual &&
  !!expected &&
  Buffer.byteLength(actual) === Buffer.byteLength(expected) &&
  timingSafeEqual(Buffer.from(actual), Buffer.from(expected));

export const verifyHostRequest = (
  request: Request,
  now = Math.floor(Date.now() / 1000),
): TrustedHostExecutionContext => {
  verifyHostServiceRequest(request);
  const bindingSecret = process.env.HOST_SESSION_BINDING_KEY;
  if (!bindingSecret || bindingSecret.length < 32)
    throw new Error("Host session binding is not configured");
  const signedContext = request.headers.get("x-host-execution-context");
  const signingSecret = process.env.HOST_EXECUTION_CONTEXT_SIGNING_KEY;
  if (!signedContext || !signingSecret || signingSecret.length < 32)
    throw new Error("Invalid Host execution context");
  const [payload, signature, ...extra] = signedContext.split(".");
  if (
    !payload ||
    !signature ||
    extra.length ||
    ![payload, signature].every((part) => /^[A-Za-z0-9_-]+$/.test(part))
  )
    throw new Error("Invalid Host execution context");
  const expected = createHmac("sha256", signingSecret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    throw new Error("Invalid Host execution context");

  let envelope: unknown;
  try {
    envelope = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid Host execution context");
  }
  if (!isHostExecutionContextEnvelope(envelope, now))
    throw new Error("Invalid Host execution context");
  return { signedContext, envelope };
};

export const verifyHostServiceRequest = (request: Request) => {
  if (
    !equal(
      request.headers.get("x-host-service-key"),
      process.env.HOST_BRIDGE_SERVICE_KEY,
    )
  )
    throw new Error("Unauthorized Host request");
};

export const sessionBinding = (
  sessionId: string,
  envelope: HostExecutionContextEnvelope,
) =>
  createHmac("sha256", process.env.HOST_SESSION_BINDING_KEY!)
    .update(
      JSON.stringify([sessionId, envelope.flowId, stableJson(envelope.claims)]),
    )
    .digest("base64url");

const isHostExecutionContextEnvelope = (
  value: unknown,
  now: number,
): value is HostExecutionContextEnvelope => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const envelope = value as Record<string, unknown>;
  return (
    Object.keys(envelope).every((key) =>
      [
        "version",
        "iss",
        "aud",
        "flowId",
        "executionId",
        "iat",
        "exp",
        "claims",
      ].includes(key),
    ) &&
    envelope.version === 1 &&
    typeof envelope.iss === "string" &&
    envelope.iss.length > 0 &&
    envelope.aud === "botflow-host-action" &&
    typeof envelope.flowId === "string" &&
    envelope.flowId.length > 0 &&
    typeof envelope.executionId === "string" &&
    envelope.executionId.length > 0 &&
    Number.isInteger(envelope.iat) &&
    Number.isInteger(envelope.exp) &&
    (envelope.iat as number) > 0 &&
    (envelope.iat as number) <= now &&
    (envelope.exp as number) > now &&
    (envelope.exp as number) - (envelope.iat as number) <= 120 &&
    !!envelope.claims &&
    typeof envelope.claims === "object" &&
    !Array.isArray(envelope.claims)
  );
};

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
};
