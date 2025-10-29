import type { ZapierBlock } from "@typebot.io/blocks-integrations/zapier/schema";

type Props = {
  block: ZapierBlock;
};

export const ZapierContent = ({ block }: Props) => {
  if (!block.options?.webhook?.url)
    return <p className="text-gray-9">Configure...</p>;
  return <p className="pr-6 truncate">Trigger zap</p>;
};
