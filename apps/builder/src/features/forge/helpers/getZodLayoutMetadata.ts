import type { ZodLayoutMetadata } from "@typebot.io/forge/zodLayout";
import type { ZodTypeAny } from "zod";

export const getZodLayoutMetadata = (
  schema: ZodTypeAny,
): ZodLayoutMetadata | undefined => {
  const meta = schema.meta?.();
  if (!meta) return undefined;
  return isZodLayoutMetadata(meta.layout) ? meta.layout : undefined;
};

const isZodLayoutMetadata = (value: unknown): value is ZodLayoutMetadata =>
  isRecord(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
