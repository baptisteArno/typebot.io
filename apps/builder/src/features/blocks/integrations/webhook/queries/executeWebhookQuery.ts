import type { HttpResponse } from "@typebot.io/blocks-integrations/webhook/schema";
import { sendRequest } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

export const executeWebhook = (
  typebotId: string,
  variables: Variable[],
  { blockId }: { blockId: string },
) =>
  sendRequest<HttpResponse>({
    url: `/api/typebots/${typebotId}/blocks/${blockId}/testWebhook`,
    method: "POST",
    body: {
      variables,
    },
  });
