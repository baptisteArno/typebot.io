import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { getRuntimeVariable } from "@typebot.io/env/getRuntimeVariable";
import type { AuthDefinition, OAuthDefinition } from "@typebot.io/forge/types";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { z } from "zod";

export const authorizeOAuthInputSchema = z.object({
  blockType: z.string(),
  clientId: z.string().optional(),
});

export const handleAuthorizeOAuth = async ({
  input: { blockType, clientId },
}: {
  input: z.infer<typeof authorizeOAuthInputSchema>;
}) => {
  const authConfig = forgedBlocks[blockType as keyof typeof forgedBlocks]?.auth;

  if (!isOAuthDefinition(authConfig))
    throw new ORPCError("BAD_REQUEST", { message: "Invalid block type" });

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
  };

  Object.entries(urlParams).forEach(([k, v]) => {
    url.searchParams.append(k, v);
  });

  return {
    headers: {
      location: url.toString(),
    },
  };
};

const isOAuthDefinition = (
  authConfig: AuthDefinition<any> | undefined,
): authConfig is OAuthDefinition => {
  return !!authConfig && authConfig.type === "oauth";
};
