import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { createToastORPCError } from "@typebot.io/lib/createToastORPCError";
import { ky } from "@typebot.io/lib/ky";
import { z } from "zod";
import { formatPhoneNumberDisplayName } from "../formatPhoneNumberDisplayName";
import {
  createMetaAppSecretProof,
  getMetaSystemTokenInfo,
} from "./getMetaSystemTokenInfo";

export const setupMetaWebhookInputSchema = z.object({
  systemToken: z.string(),
  appSecret: z.string().trim().optional(),
  wabaId: z.string().trim().min(1),
  phoneNumberId: z.string().trim().min(1),
  subscribe: z.boolean().optional(),
});

export const handleSetupMetaWebhook = async ({
  input,
}: {
  input: z.infer<typeof setupMetaWebhookInputSchema>;
}) => {
  const appSecretProofSearchParam = input.appSecret
    ? {
        appsecret_proof: createMetaAppSecretProof({
          systemUserAccessToken: input.systemToken,
          appSecret: input.appSecret,
        }),
      }
    : undefined;

  try {
    const {
      data: { app_id },
    } = await getMetaSystemTokenInfo({
      systemUserAccessToken: input.systemToken,
      appSecret: input.appSecret,
    });

    const phoneNumber = await getWabaPhoneNumber({
      systemUserAccessToken: input.systemToken,
      wabaId: input.wabaId,
      phoneNumberId: input.phoneNumberId,
      searchParams: appSecretProofSearchParam,
    });

    const isSubscribed = input.subscribe
      ? await isAppSubscribedToWaba({
          systemUserAccessToken: input.systemToken,
          wabaId: input.wabaId,
          appId: app_id,
          searchParams: appSecretProofSearchParam,
        })
      : false;

    if (input.subscribe && !isSubscribed)
      await subscribeAppToWaba({
        systemUserAccessToken: input.systemToken,
        wabaId: input.wabaId,
        searchParams: appSecretProofSearchParam,
      });

    return {
      name: formatPhoneNumberDisplayName(phoneNumber.display_phone_number),
      wabaId: input.wabaId,
      subscribedAppId: app_id,
      wasAlreadySubscribed: isSubscribed,
    };
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    if (input.appSecret)
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Could not validate the app secret with this System User Token. Make sure the app secret belongs to the Meta app used to generate the token.",
      });

    throw await createToastORPCError(err);
  }
};

const getWabaPhoneNumber = async ({
  systemUserAccessToken,
  wabaId,
  phoneNumberId,
  searchParams,
}: {
  systemUserAccessToken: string;
  wabaId: string;
  phoneNumberId: string;
  searchParams?: Record<string, string>;
}) => {
  try {
    const phoneNumbers = await getAllWabaPhoneNumbers({
      systemUserAccessToken,
      wabaId,
      searchParams,
    });
    const phoneNumber = phoneNumbers.find(({ id }) => id === phoneNumberId);
    if (phoneNumber) return phoneNumber;
  } catch (_err) {
    throw new ORPCError("BAD_REQUEST", {
      message:
        "Could not access this WhatsApp Business Account. Make sure the System User Token can manage this WABA.",
    });
  }

  throw new ORPCError("BAD_REQUEST", {
    message:
      "This phone number ID was not found in the provided WhatsApp Business Account.",
  });
};

const getAllWabaPhoneNumbers = async ({
  systemUserAccessToken,
  wabaId,
  searchParams,
}: {
  systemUserAccessToken: string;
  wabaId: string;
  searchParams?: Record<string, string>;
}) => {
  const url = new URL(
    `${env.WHATSAPP_CLOUD_API_URL}/v17.0/${wabaId}/phone_numbers`,
  );
  url.searchParams.set("fields", "id,display_phone_number");
  url.searchParams.set("limit", "100");
  setSearchParams(url, searchParams);

  const phoneNumbers = [];
  let nextUrl: string | undefined = url.toString();

  while (nextUrl) {
    const paginatedUrl = new URL(nextUrl);
    setSearchParams(paginatedUrl, searchParams);
    const { data, paging } = wabaPhoneNumbersResponseSchema.parse(
      await ky
        .get(paginatedUrl, {
          headers: {
            Authorization: `Bearer ${systemUserAccessToken}`,
          },
        })
        .json(),
    );
    phoneNumbers.push(...data);
    nextUrl = paging?.next;
  }

  return phoneNumbers;
};

const isAppSubscribedToWaba = async ({
  systemUserAccessToken,
  wabaId,
  appId,
  searchParams,
}: {
  systemUserAccessToken: string;
  wabaId: string;
  appId: string;
  searchParams?: Record<string, string>;
}) => {
  const subscribedAppsUrl = new URL(
    `${env.WHATSAPP_CLOUD_API_URL}/v17.0/${wabaId}/subscribed_apps`,
  );
  setSearchParams(subscribedAppsUrl, searchParams);

  try {
    const { data } = wabaSubscribedAppsResponseSchema.parse(
      await ky
        .get(subscribedAppsUrl, {
          headers: {
            Authorization: `Bearer ${systemUserAccessToken}`,
          },
        })
        .json(),
    );

    return data.some(
      ({ id, whatsapp_business_api_data }) =>
        (whatsapp_business_api_data?.id ?? id) === appId,
    );
  } catch (_err) {
    throw new ORPCError("BAD_REQUEST", {
      message:
        "Could not read the apps subscribed to this WhatsApp Business Account.",
    });
  }
};

const subscribeAppToWaba = async ({
  systemUserAccessToken,
  wabaId,
  searchParams,
}: {
  systemUserAccessToken: string;
  wabaId: string;
  searchParams?: Record<string, string>;
}) => {
  const subscribedAppsUrl = new URL(
    `${env.WHATSAPP_CLOUD_API_URL}/v17.0/${wabaId}/subscribed_apps`,
  );
  setSearchParams(subscribedAppsUrl, searchParams);

  try {
    await ky.post(subscribedAppsUrl, {
      headers: {
        Authorization: `Bearer ${systemUserAccessToken}`,
      },
    });
  } catch (_err) {
    throw new ORPCError("BAD_REQUEST", {
      message:
        "Could not subscribe your Meta app to this WhatsApp Business Account. Make sure the System User Token can manage the app and this WABA.",
    });
  }
};

const setSearchParams = (url: URL, searchParams?: Record<string, string>) => {
  if (!searchParams) return;
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
};

const wabaPhoneNumberSchema = z.object({
  id: z.string(),
  display_phone_number: z.string(),
});

const wabaPhoneNumbersResponseSchema = z.object({
  data: z.array(wabaPhoneNumberSchema),
  paging: z
    .object({
      next: z.string().optional(),
    })
    .optional(),
});

const wabaSubscribedAppsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().optional(),
      whatsapp_business_api_data: z
        .object({
          id: z.string(),
        })
        .optional(),
    }),
  ),
});
