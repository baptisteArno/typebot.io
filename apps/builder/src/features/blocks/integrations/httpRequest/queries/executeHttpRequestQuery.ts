import type { HttpResponse } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { sendRequest } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

export const executeHttpRequest = (
  typebotId: string,
  variables: Variable[],
  { blockId }: { blockId: string },
) =>
  sendRequest<HttpResponse>({
    url: `/api/typebots/${typebotId}/blocks/${blockId}/testHttpRequest`,
    method: "POST",
    body: {
      variables,
    },
  });
