import { Stack, useDisclosure } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import type React from "react";
import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
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

  const isDisabled = currentUserMode !== "write" && !data?.customDomains.length;

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
      <Tooltip.Root disabled={!isDisabled}>
        <Tooltip.Trigger>
          <Menu.TriggerButton
            variant="secondary"
            className="justify-between"
            disabled={isDisabled}
          >
            {currentCustomDomain ?? t("customDomain.add")}
            <ArrowDown01Icon />
          </Menu.TriggerButton>
        </Tooltip.Trigger>
        <Tooltip.Popup>
          Only workspace owners can add custom domains
        </Tooltip.Popup>
      </Tooltip.Root>
      <Menu.Popup>
        <Stack maxH={"35vh"} overflowY="auto" spacing="0">
          {(data?.customDomains ?? []).map((customDomain) => (
            <Menu.Item
              key={customDomain.name}
              onClick={handleMenuItemClick(customDomain.name)}
              className="justify-between"
            >
              {customDomain.name}
              {currentUserMode === "write" && (
                <Button
                  aria-label={t("customDomain.remove")}
                  size="icon"
                  onClick={handleDeleteDomainClick(customDomain.name)}
                  disabled={isDeleting === customDomain.name}
                >
                  <TrashIcon />
                </Button>
              )}
            </Menu.Item>
          ))}
          {currentUserMode === "write" && (
            <Menu.Item onClick={onOpen}>
              <PlusIcon />
              {t("connectNew")}
            </Menu.Item>
          )}
        </Stack>
      </Menu.Popup>
    </Menu.Root>
  );
};
