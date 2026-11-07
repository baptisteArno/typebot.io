import { createActionHandler } from "@typebot.io/forge";
import { startCall } from "../actions/startCall";
import type { startCallResponseItems } from "../constants";
import { buildLead } from "../helpers/buildLead";
import { createFamulorClient } from "../helpers/createFamulorClient";
import { isUuid } from "../helpers/isUuid";
import { normalizeE164 } from "../helpers/normalizeE164";
import { readFamulorFailure } from "../helpers/readFamulorFailure";
import { setMappedVariables } from "../helpers/setMappedVariables";
import type { FamulorCall, FamulorEnvelope } from "../types";

type StartCallResponseItem = (typeof startCallResponseItems)[number];

export const startCallHandler = createActionHandler(startCall, {
  server: async ({ credentials, options, variables, logs }) => {
    const assistantId = options.assistantId?.trim();
    const toNumber = normalizeE164(options.toNumber);
    const phoneNumberId = options.phoneNumberId?.trim();

    if (!credentials?.apiKey) return logs.add("API key is required");
    if (!isUuid(assistantId)) return logs.add("Select a Famulor assistant.");
    if (!toNumber)
      return logs.add(
        "Enter a destination phone number in E.164 format, for example +4930123456.",
      );
    if (phoneNumberId && !isUuid(phoneNumberId))
      return logs.add("Caller ID must be a Famulor phone number.");

    const client = createFamulorClient({
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    });
    if (!client.ok) return logs.add(client.message);

    const lead = buildLead(options);
    const body: Record<string, unknown> = {
      assistant_id: assistantId,
      to_number: toNumber,
    };
    if (phoneNumberId) body.phone_number_id = phoneNumberId;
    if (lead) body.lead = lead;

    try {
      const response = await client.post<FamulorEnvelope<FamulorCall>>(
        "/calls",
        body,
      );
      const call = response.data;
      if (!call?.id) return logs.add("Famulor did not return a call id.");

      setMappedVariables(variables, options.responseMapping, (item) =>
        readStartCallResponseItem(item, call),
      );
      logs.add({
        status: "success",
        description: `Famulor call queued (${call.id}).`,
      });
    } catch (err) {
      logs.add(
        await readFamulorFailure({
          err,
          context: "While starting a Famulor call",
        }),
      );
    }
  },
});

const readStartCallResponseItem = (
  item: StartCallResponseItem,
  call: FamulorCall,
) => {
  switch (item) {
    case "Call ID":
      return call.id ?? null;
    case "Status":
      return call.status ?? null;
    default: {
      const unhandled: never = item;
      return unhandled;
    }
  }
};
