import { useQuery } from "@tanstack/react-query";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { CancelCircleIcon } from "@typebot.io/ui/icons/CancelCircleIcon";
import { trpc } from "@/lib/queryClient";
import { CustomDomainConfigDialog } from "./CustomDomainConfigDialog";

type Props = {
  domain: string;
  workspaceId: string;
};
export default function DomainStatusIcon({ domain, workspaceId }: Props) {
  const { isOpen, onOpen, onClose } = useOpenControls();
  const { data, isLoading } = useQuery(
    trpc.customDomains.verifyCustomDomain.queryOptions({
      name: domain,
      workspaceId,
    }),
  );

  if (isLoading || data?.status === "Valid Configuration") return null;

  return (
    <>
      <MoreInfoTooltip
        icon={<CancelCircleIcon className="text-red-9" />}
        onClick={onOpen}
      >
        {data?.status}
      </MoreInfoTooltip>
      <CustomDomainConfigDialog
        workspaceId={workspaceId}
        isOpen={isOpen}
        domain={domain}
        onClose={onClose}
      />
    </>
  );
}
