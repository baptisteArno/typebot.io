import { XCircleIcon } from "@/components/icons";
import { trpc } from "@/lib/queryClient";
import { Flex, Tooltip, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { CustomDomainConfigModal } from "./CustomDomainConfigModal";

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
      <Tooltip label={data?.status}>
        <Flex onClick={onOpen} cursor="pointer">
          <XCircleIcon stroke="red.500" />
        </Flex>
      </Tooltip>
      <CustomDomainConfigModal
        workspaceId={workspaceId}
        isOpen={isOpen}
        domain={domain}
        onClose={onClose}
      />
    </>
  );
}
