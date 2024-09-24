import type { LinkedTypebot } from "@/providers/TypebotProvider";
import type { LogicState } from "@/types";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { sendRequest } from "@typebot.io/lib/utils";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export const fetchAndInjectTypebot = async (
  block: TypebotLinkBlock,
  { apiHost, injectLinkedTypebot, isPreview }: LogicState,
): Promise<LinkedTypebot | undefined> => {
  const { data, error } = isPreview
    ? await sendRequest<{ typebot: Typebot }>(
        `/api/typebots/${block.options?.typebotId}`,
      )
    : await sendRequest<{ typebot: PublicTypebot }>(
        `${apiHost}/api/publicTypebots/${block.options?.typebotId}`,
      );
  if (!data || error) return;
  return injectLinkedTypebot(data.typebot);
};
