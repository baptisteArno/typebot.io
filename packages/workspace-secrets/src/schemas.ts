import { z } from "zod";
import {
  workspaceSecretMaxValueLength,
  workspaceSecretNameRegex,
} from "./constants";

export const workspaceSecretNameSchema = z
  .string()
  .regex(
    workspaceSecretNameRegex,
    "Must be uppercase letters, digits and underscores, start with a letter, max 64 chars",
  );

export const workspaceSecretValueSchema = z
  .string()
  .min(1)
  .max(workspaceSecretMaxValueLength);

export const workspaceSecretMetadataSchema = z.object({
  id: z.string(),
  name: workspaceSecretNameSchema,
  workspaceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type WorkspaceSecretMetadata = z.infer<
  typeof workspaceSecretMetadataSchema
>;
