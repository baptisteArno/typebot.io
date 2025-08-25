import { PlusIcon } from "@/components/icons";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import type React from "react";
import { useState } from "react";
import { CreateCustomDomainDialog } from "./CreateCustomDomainDialog";

type Props = {
  currentCustomDomain?: string;
  onCustomDomainSelect: (domain: string) => void;
};

export const CustomDomainsDropdown = ({
  currentCustomDomain,
  onCustomDomainSelect,
}: Props) => {
  const { t } = useTranslate();
  const [isDeleting, setIsDeleting] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { workspace, currentUserMode } = useWorkspace();
  const { data, refetch } = useQuery(
    trpc.customDomains.listCustomDomains.queryOptions(
      {
        workspaceId: workspace?.id as string,
      },
      {
        enabled: !!workspace?.id && currentUserMode !== "guest",
      },
    ),
  );
  const { mutate } = useMutation(
    trpc.customDomains.deleteCustomDomain.mutationOptions({
      onMutate: ({ name }) => {
        setIsDeleting(name);
      },
      onError: (error) => {
        toast({
          title: "Error while deleting custom domain",
          description: error.message,
        });
      },
      onSettled: () => {
        setIsDeleting("");
      },
      onSuccess: () => {
        refetch();
      },
    }),
  );

  const handleMenuItemClick = (customDomain: string) => () =>
    onCustomDomainSelect(customDomain);

  const handleDeleteDomainClick =
    (domainName: string) => async (e: React.MouseEvent) => {
      if (!workspace) return;
      e.stopPropagation();
      mutate({
        name: domainName,
        workspaceId: workspace.id,
      });
    };

  const handleNewDomain = (name: string) => {
    onCustomDomainSelect(name);
  };

  return (
    <Menu.Root>
      {workspace?.id && (
        <CreateCustomDomainDialog
          workspaceId={workspace.id}
          isOpen={isOpen}
          onClose={onClose}
          onNewDomain={handleNewDomain}
        />
      )}
      <Menu.TriggerButton variant="secondary" className="justify-between">
        <Text noOfLines={1} overflowY="visible" h="20px">
          {currentCustomDomain ?? t("customDomain.add")}
        </Text>
        <ChevronDownIcon />
      </Menu.TriggerButton>
      <Menu.Popup>
        <Stack maxH={"35vh"} overflowY="auto" spacing="0">
          {(data?.customDomains ?? []).map((customDomain) => (
            <Menu.Item
              key={customDomain.name}
              onClick={handleMenuItemClick(customDomain.name)}
              className="justify-between"
            >
              {customDomain.name}
              <Button
                aria-label={t("customDomain.remove")}
                size="icon"
                onClick={handleDeleteDomainClick(customDomain.name)}
                disabled={isDeleting === customDomain.name}
              >
                <TrashIcon />
              </Button>
            </Menu.Item>
          ))}
          <Menu.Item onClick={onOpen}>
            <PlusIcon />
            {t("connectNew")}
          </Menu.Item>
        </Stack>
      </Menu.Popup>
    </Menu.Root>
  );
};
