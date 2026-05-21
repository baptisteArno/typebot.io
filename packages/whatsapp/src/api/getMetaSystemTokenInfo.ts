import { createHmac } from "node:crypto";
import { env } from "@typebot.io/env";
import { ky } from "@typebot.io/lib/ky";

export const createMetaAppSecretProof = ({
  systemUserAccessToken,
  appSecret,
}: {
  systemUserAccessToken: string;
  appSecret: string;
}) =>
  createHmac("sha256", appSecret).update(systemUserAccessToken).digest("hex");

export const getMetaSystemTokenInfo = ({
  systemUserAccessToken,
  appSecret,
}: {
  systemUserAccessToken: string;
  appSecret?: string;
}) => {
  const debugTokenUrl = new URL(
    `${env.WHATSAPP_CLOUD_API_URL}/v17.0/debug_token`,
  );
  debugTokenUrl.searchParams.set("input_token", systemUserAccessToken);
  if (appSecret)
    debugTokenUrl.searchParams.set(
      "appsecret_proof",
      createMetaAppSecretProof({ systemUserAccessToken, appSecret }),
    );

  return ky
    .get(debugTokenUrl, {
      headers: {
        Authorization: `Bearer ${systemUserAccessToken}`,
      },
    })
    .json<{
      data: {
        app_id: string;
        application: string;
        expires_at: number;
        scopes: string[];
      };
    }>();
};
