import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { XCircleIcon } from "@/components/icons";
import { trpc } from "@/lib/queryClient";
import { useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { CustomDomainConfigDialog } from "./CustomDomainConfigDialog";

type Props = {
  domain: string;
  workspaceId: string;
};
export default function DomainStatusIcon({ domain, workspaceId }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading } = useQuery(
    trpc.customDomains.verifyCustomDomain.queryOptions({
      name: domain,
      workspaceId,
    }),
  );

  if (isLoading || data?.status === "Valid Configuration") return null;

  return (
    <>
      <MoreInfoTooltip icon={<XCircleIcon stroke="red.500" />} onClick={onOpen}>
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
