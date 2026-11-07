import { createFetcherHandler } from "@typebot.io/forge";
import { assistantsFetcher, startCall } from "../actions/startCall";
import { createFamulorClient } from "../helpers/createFamulorClient";
import { readFamulorFailure } from "../helpers/readFamulorFailure";
import type { FamulorAssistant } from "../types";

export const fetchAssistantsHandler = createFetcherHandler(
  startCall,
  assistantsFetcher.id,
  async ({ credentials }) => {
    if (!credentials?.apiKey) return { data: [] };

    const client = createFamulorClient({
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    });
    if (!client.ok) return { error: { description: client.message } };

    try {
      const assistants = await client.listAll<FamulorAssistant>("/assistants");
      return {
        data: assistants.flatMap((assistant) => {
          if (!assistant.id) return [];
          const name = assistant.name?.trim() || assistant.id;
          const label =
            assistant.is_active === false ? `${name} (inactive)` : name;
          return [{ value: assistant.id, label }];
        }),
      };
    } catch (err) {
      return {
        error: await readFamulorFailure({
          err,
          context: "While listing Famulor assistants",
        }),
      };
    }
  },
);
