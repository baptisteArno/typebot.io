import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { clientUserSchema } from "@typebot.io/user/schemas";
import { z } from "zod";
import {
  acceptTermsOutputSchema,
  handleAcceptTerms,
} from "./handleAcceptTerms";
import {
  apiTokenWithTokenSchema,
  createApiTokenInputSchema,
  handleCreateApiToken,
} from "./handleCreateApiToken";
import {
  apiTokenSchema,
  deleteApiTokenInputSchema,
  handleDeleteApiToken,
} from "./handleDeleteApiToken";
import {
  handleListApiTokens,
  listApiTokensOutputSchema,
} from "./handleListApiTokens";
import { handleUpdateUser, updateUserInputSchema } from "./handleUpdateUser";

export const userRouter = {
  update: authenticatedProcedure
    .input(updateUserInputSchema)
    .output(clientUserSchema)
    .route({
      method: "PATCH",
      path: "/v1/users/me",
      operationId: "user-update",
      tags: ["User"],
    })
    .handler(handleUpdateUser),

  listApiTokens: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/users/me/api-tokens",
      operationId: "user-listApiTokens",
      tags: ["User"],
    })
    .output(
      z.object({
        apiTokens: z.array(listApiTokensOutputSchema),
      }),
    )
    .handler(handleListApiTokens),

  createApiToken: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/users/me/api-tokens",
      operationId: "user-createApiToken",
      tags: ["User"],
    })
    .input(createApiTokenInputSchema)
    .output(
      z.object({
        apiToken: apiTokenWithTokenSchema,
      }),
    )
    .handler(handleCreateApiToken),

  deleteApiToken: authenticatedProcedure
    .route({
      method: "DELETE",
      path: "/v1/users/me/api-tokens/{tokenId}",
      operationId: "user-deleteApiToken",
      tags: ["User"],
    })
    .input(deleteApiTokenInputSchema)
    .output(
      z.object({
        apiToken: apiTokenSchema,
      }),
    )
    .handler(handleDeleteApiToken),
  acceptTerms: authenticatedProcedure
    .input(z.void())
    .output(acceptTermsOutputSchema)
    .handler(handleAcceptTerms),
};
