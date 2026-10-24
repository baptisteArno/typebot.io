import { createActionHandler } from "@typebot.io/forge";
import { getCall } from "../actions/getCall";
import type { getCallResponseItems } from "../constants";
import { createFamulorClient } from "../helpers/createFamulorClient";
import { formatTranscript } from "../helpers/formatTranscript";
import { isUuid } from "../helpers/isUuid";
import { readFamulorFailure } from "../helpers/readFamulorFailure";
import { setMappedVariables } from "../helpers/setMappedVariables";
import type { FamulorCall, FamulorEnvelope } from "../types";

type GetCallResponseItem = (typeof getCallResponseItems)[number];

export const getCallHandler = createActionHandler(getCall, {
  server: async ({ credentials, options, variables, logs }) => {
    const callId = options.callId?.trim();
    if (!credentials?.apiKey) return logs.add("API key is required");
    if (!isUuid(callId)) return logs.add("Enter a Famulor call ID.");

    const client = createFamulorClient({
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    });
    if (!client.ok) return logs.add(client.message);

    try {
      const response = await client.get<FamulorEnvelope<FamulorCall>>(
        `/calls/${callId}`,
      );
      const call = response.data;
      if (!call?.id) return logs.add("Famulor did not return this call.");

      setMappedVariables(variables, options.responseMapping, (item) =>
        readGetCallResponseItem(item, call),
      );
    } catch (err) {
      logs.add(
        await readFamulorFailure({
          err,
          context: "While reading a Famulor call",
        }),
      );
    }
  },
});

const readGetCallResponseItem = (
  item: GetCallResponseItem,
  call: FamulorCall,
) => {
  switch (item) {
    case "Status":
      return call.status ?? null;
    case "Transcript":
      return formatTranscript(call);
    case "Summary":
      return call.summary ?? null;
    case "Duration (seconds)":
      return call.duration_sec ?? null;
    case "Recording URL":
      return call.recording_url ?? null;
    default: {
      const unhandled: never = item;
      return unhandled;
    }
  }
};
