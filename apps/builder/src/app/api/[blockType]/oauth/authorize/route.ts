import { env } from "@typebot.io/env";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import type { AuthDefinition, OAuthDefinition } from "@typebot.io/forge/types";
import { z } from "@typebot.io/zod";
import { type NextRequest, NextResponse } from "next/server";

const searchParamsSchema = z.object({
  clientId: z.string().optional(),
});

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ blockType: string }> },
) => {
  const { blockType } = await params;
  const authConfig = forgedBlocks[blockType as keyof typeof forgedBlocks].auth;
  if (!isOAuthDefinition(authConfig))
    return NextResponse.json({ error: "Invalid block type" }, { status: 400 });
  const { success, data, error } = searchParamsSchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!success)
    return NextResponse.json({ error: error.message }, { status: 400 });
  const clientId =
    data.clientId ||
    (authConfig.defaultClientEnvKeys
      ? process.env[authConfig.defaultClientEnvKeys.id]
      : undefined);
  if (!clientId)
    return NextResponse.json(
      { error: "Client ID is required" },
      { status: 400 },
    );
  const url = new URL(authConfig.authUrl);
  const urlParams = {
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${env.NEXTAUTH_URL}/oauth/redirect`,
    scope: authConfig.scopes.join(" "),
    ...authConfig.extraAuthParams,
  };
  Object.entries(urlParams).forEach(([k, v]) => url.searchParams.append(k, v));
  return NextResponse.redirect(url);
};

const isOAuthDefinition = (
  authConfig: AuthDefinition<any> | undefined,
): authConfig is OAuthDefinition => {
  return !!authConfig && authConfig.type === "oauth";
};
