import {
  authenticatedProcedure,
  publicProcedure,
} from "@typebot.io/config/orpc/builder/middlewares";
import { z } from "zod";
import {
  authorizeOAuthInputSchema,
  handleAuthorizeOAuth,
} from "./handleAuthorizeOAuth";
import {
  createCredentialsInputSchema,
  handleCreateCredentials,
} from "./handleCreateCredentials";
import {
  createOAuthCredentialsInputSchema,
  handleCreateOAuthCredentials,
} from "./handleCreateOAuthCredentials";
import {
  deleteCredentialsInputSchema,
  handleDeleteCredentials,
} from "./handleDeleteCredentials";
import {
  getCredentialsInputSchema,
  handleGetCredentials,
} from "./handleGetCredentials";
import {
  handleListCredentials,
  listCredentialsInputSchema,
  outputCredentialsSchema,
} from "./handleListCredentials";
import {
  handleUpdateCredentials,
  updateCredentialsInputSchema,
} from "./handleUpdateCredentials";
import {
  handleUpdateOAuthCredentials,
  updateOAuthCredentialsInputSchema,
} from "./handleUpdateOAuthCredentials";

export const credentialsRouter = {
  authorizeOAuth: publicProcedure
    .route({
      method: "GET",
      path: "/{blockType}/oauth/authorize",
      successStatus: 307,
      outputStructure: "detailed",
    })
    .input(authorizeOAuthInputSchema)
    .output(
      z.object({
        headers: z.object({
          location: z.string(),
        }),
      }),
    )
    .handler(handleAuthorizeOAuth),

  createCredentials: authenticatedProcedure
    .input(createCredentialsInputSchema)
    .output(
      z.object({
        credentialsId: z.string(),
      }),
    )
    .handler(handleCreateCredentials),

  createOAuthCredentials: authenticatedProcedure
    .input(createOAuthCredentialsInputSchema)
    .output(
      z.object({
        credentialsId: z.string(),
      }),
    )
    .handler(handleCreateOAuthCredentials),

  updateOAuthCredentials: authenticatedProcedure
    .input(updateOAuthCredentialsInputSchema)
    .output(
      z.object({
        credentialsId: z.string(),
      }),
    )
    .handler(handleUpdateOAuthCredentials),

  listCredentials: authenticatedProcedure
    .input(listCredentialsInputSchema)
    .output(
      z.object({
        credentials: outputCredentialsSchema,
      }),
    )
    .handler(handleListCredentials),

  getCredentials: authenticatedProcedure
    .input(getCredentialsInputSchema)
    .handler(handleGetCredentials),

  deleteCredentials: authenticatedProcedure
    .input(deleteCredentialsInputSchema)
    .output(
      z.object({
        credentialsId: z.string(),
      }),
    )
    .handler(handleDeleteCredentials),

  updateCredentials: authenticatedProcedure
    .input(updateCredentialsInputSchema)
    .output(
      z.object({
        credentialsId: z.string(),
      }),
    )
    .handler(handleUpdateCredentials),
};
