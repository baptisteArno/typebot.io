import type { SendEmailBlock } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { Badge } from "@typebot.io/ui/components/Badge";

type Props = {
  block: SendEmailBlock;
};

export const SendEmailContent = ({ block }: Props) => {
  if ((block.options?.recipients?.length ?? 0) === 0)
    return <p color="gray.500">Configure...</p>;
  return (
    <div className="flex flex-wrap pr-6 line-clamp-2">
      <div>
        <p>Send email to</p>
      </div>
      {block.options?.recipients?.map((to) => (
        <div key={to}>
          <Badge>{to}</Badge>
        </div>
      ))}
    </div>
  );
};
