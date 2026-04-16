import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { z } from "zod";
import {
  createWorkspaceSecretInputSchema,
  handleCreateWorkspaceSecret,
} from "./handleCreateWorkspaceSecret";
import {
  deleteWorkspaceSecretInputSchema,
  handleDeleteWorkspaceSecret,
} from "./handleDeleteWorkspaceSecret";
import {
  handleListWorkspaceSecrets,
  listWorkspaceSecretsInputSchema,
  workspaceSecretListItemSchema,
} from "./handleListWorkspaceSecrets";
import {
  handleUpdateWorkspaceSecret,
  updateWorkspaceSecretInputSchema,
} from "./handleUpdateWorkspaceSecret";

const secretRefSchema = z.object({ id: z.string(), name: z.string() });

export const workspaceSecretsRouter = {
  createWorkspaceSecret: authenticatedProcedure
    .input(createWorkspaceSecretInputSchema)
    .output(z.object({ secret: secretRefSchema }))
    .handler(handleCreateWorkspaceSecret),

  listWorkspaceSecrets: authenticatedProcedure
    .input(listWorkspaceSecretsInputSchema)
    .output(z.object({ secrets: z.array(workspaceSecretListItemSchema) }))
    .handler(handleListWorkspaceSecrets),

  updateWorkspaceSecret: authenticatedProcedure
    .input(updateWorkspaceSecretInputSchema)
    .output(z.object({ secret: secretRefSchema }))
    .handler(handleUpdateWorkspaceSecret),

  deleteWorkspaceSecret: authenticatedProcedure
    .input(deleteWorkspaceSecretInputSchema)
    .output(z.object({ secretId: z.string() }))
    .handler(handleDeleteWorkspaceSecret),
};
