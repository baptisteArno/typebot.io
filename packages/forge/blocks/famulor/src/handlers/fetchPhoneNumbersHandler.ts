import { createFetcherHandler } from "@typebot.io/forge";
import { phoneNumbersFetcher, startCall } from "../actions/startCall";
import { createFamulorClient } from "../helpers/createFamulorClient";
import { readFamulorFailure } from "../helpers/readFamulorFailure";
import type { FamulorPhoneNumber } from "../types";

export const fetchPhoneNumbersHandler = createFetcherHandler(
  startCall,
  phoneNumbersFetcher.id,
  async ({ credentials }) => {
    if (!credentials?.apiKey) return { data: [] };

    const client = createFamulorClient({
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    });
    if (!client.ok) return { error: { description: client.message } };

    try {
      const phoneNumbers =
        await client.listAll<FamulorPhoneNumber>("/phone-numbers");
      return {
        data: phoneNumbers.flatMap((phoneNumber) => {
          if (!phoneNumber.id || !phoneNumber.number) return [];
          if (phoneNumber.direction_outbound === false) return [];
          return [{ value: phoneNumber.id, label: phoneNumber.number }];
        }),
      };
    } catch (err) {
      return {
        error: await readFamulorFailure({
          err,
          context: "While listing Famulor phone numbers",
        }),
      };
    }
  },
);
