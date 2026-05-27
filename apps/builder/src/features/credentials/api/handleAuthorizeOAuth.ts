import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { getRuntimeVariable } from "@typebot.io/env/getRuntimeVariable";
import { z } from "zod";
import { getOAuthBlockDefinition } from "./getOAuthBlockDefinition";

export const authorizeOAuthInputSchema = z.object({
  blockType: z.string(),
  clientId: z.string().optional(),
  state: z.string().optional(),
});

export const handleAuthorizeOAuth = async ({
  input: { blockType, clientId, state },
}: {
  input: z.infer<typeof authorizeOAuthInputSchema>;
}) => {
  const authConfig = getOAuthBlockDefinition(blockType).auth;

  const resolvedClientId =
    clientId ||
    (authConfig.defaultClientEnvKeys
      ? getRuntimeVariable(authConfig.defaultClientEnvKeys.id)
      : undefined);

  if (!resolvedClientId)
    throw new ORPCError("BAD_REQUEST", { message: "Client ID is required" });

  const url = new URL(authConfig.authUrl);
  const urlParams = {
    response_type: "code",
    client_id: resolvedClientId,
    redirect_uri: `${env.NEXTAUTH_URL}/oauth/redirect`,
    scope: authConfig.scopes.join(" "),
    ...authConfig.extraAuthParams,
    ...(state ? { state } : {}),
  };

  Object.entries(urlParams).forEach(([k, v]) => {
    if (!v) return;
    url.searchParams.append(k, v);
  });

  return {
    headers: {
      location: url.toString(),
    },
  };
};
