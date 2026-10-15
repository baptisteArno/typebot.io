import { ky } from "@typebot.io/lib/ky";
import { HTTPError } from "ky";
import {
  appIdentityTokenUrl,
  chatApiBaseUrl,
  minDelayBetweenChatRequestsMs,
} from "../constants";

const accessTokenRefreshMarginMs = 30_000;

export const createBlinkChatClient = async ({
  clientId,
  clientSecret,
}: {
  clientId: string;
  clientSecret: string;
}) => {
  let accessToken = await fetchAppIdentityAccessToken({
    clientId,
    clientSecret,
  });
  let nextRequestAllowedAt = 0;

  const chatApi = ky.extend({
    prefixUrl: chatApiBaseUrl,
    retry: {
      limit: 3,
      methods: ["post"],
      statusCodes: [429],
      delay: () => 1000,
    },
    hooks: {
      beforeRequest: [
        async (request) => {
          if (accessToken.expiresAt - Date.now() < accessTokenRefreshMarginMs)
            accessToken = await fetchAppIdentityAccessToken({
              clientId,
              clientSecret,
            });
          const waitMs = nextRequestAllowedAt - Date.now();
          if (waitMs > 0) await sleep(waitMs);
          nextRequestAllowedAt = Date.now() + minDelayBetweenChatRequestsMs;
          request.headers.set("Authorization", `Bearer ${accessToken.value}`);
        },
      ],
      // ky also retries network errors, which could deliver a message twice
      // if Blink stored it before the connection dropped.
      beforeRetry: [
        ({ error }) => {
          if (!(error instanceof HTTPError && error.response.status === 429))
            throw error;
        },
      ],
    },
  });

  const sender = { "@type": "app", app_identity_id: clientId };

  return {
    // Untitled private chats are unique per set of members, so this returns
    // the existing direct chat instead of creating a duplicate.
    openDirectChat: async (userId: string) => {
      const { chat_id } = await chatApi
        .post("chats", {
          json: {
            access_rule: { "@type": "private" },
            members: [sender, { "@type": "user", user_id: userId }],
            organisation_id: accessToken.organisationId,
          },
        })
        .json<{ chat_id: string }>();
      return chat_id;
    },
    sendMarkdownMessage: async ({
      chatId,
      markdown,
      unfurlLinks,
    }: {
      chatId: string;
      markdown: string;
      unfurlLinks: boolean;
    }) => {
      await chatApi.post(`chats/${chatId}/messages`, {
        json: {
          sender,
          body: { "@type": "markdown", markdown },
          unfurl_links: unfurlLinks,
        },
      });
    },
  };
};

const fetchAppIdentityAccessToken = async ({
  clientId,
  clientSecret,
}: {
  clientId: string;
  clientSecret: string;
}) => {
  const { access_token, expires_in } = await ky
    .post(appIdentityTokenUrl, {
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    .json<{ access_token: string; expires_in: number }>();
  const organisationId = parseOrganisationIdFromAccessToken(access_token);
  if (!organisationId)
    throw new Error("Blink access token does not contain an organisation ID");
  return {
    value: access_token,
    organisationId,
    expiresAt: Date.now() + expires_in * 1000,
  };
};

const parseOrganisationIdFromAccessToken = (accessToken: string) => {
  const encodedPayload = accessToken.split(".")[1];
  if (!encodedPayload) return;
  const payload: unknown = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString(),
  );
  if (
    typeof payload === "object" &&
    payload !== null &&
    "organisation_id" in payload &&
    typeof payload.organisation_id === "string"
  )
    return payload.organisation_id;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
