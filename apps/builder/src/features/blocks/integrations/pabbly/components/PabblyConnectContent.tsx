import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";

type Props = {
  block: PabblyConnectBlock;
};

export const PabblyConnectContent = ({ block }: Props) => {
  if (!block.options?.webhook?.url)
    return <p className="text-gray-9">Configure...</p>;
  return <p className="pr-6 truncate">Trigger scenario</p>;
};
