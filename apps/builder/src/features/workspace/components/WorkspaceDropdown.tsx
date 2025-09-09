import { HStack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import {
  CheckIcon,
  HardDriveIcon,
  LogOutIcon,
  PlusIcon,
} from "@/components/icons";
import { PlanTag } from "@/features/billing/components/PlanTag";
import { trpc } from "@/lib/queryClient";
import type { WorkspaceInApp } from "../WorkspaceProvider";

type Props = {
  currentWorkspace?: WorkspaceInApp;
  isLoggingOut: boolean;
  onWorkspaceSelected: (workspaceId: string) => void;
  onCreateNewWorkspaceClick: () => void;
  onLogoutClick: () => void;
};

export const WorkspaceDropdown = ({
  currentWorkspace,
  isLoggingOut,
  onWorkspaceSelected,
  onLogoutClick,
  onCreateNewWorkspaceClick,
}: Props) => {
  const { t } = useTranslate();
  const { data } = useQuery(trpc.workspace.listWorkspaces.queryOptions());

  const workspaces = data?.workspaces ?? [];

  return (
    <Menu.Root>
      <Menu.TriggerButton variant="outline-secondary">
        <HStack>
          {!isLoggingOut && currentWorkspace && (
            <>
              <Text isTruncated maxW="300px">
                {currentWorkspace.name}
              </Text>
              <PlanTag plan={currentWorkspace.plan} />
            </>
          )}
          <ChevronDownIcon />
        </HStack>
      </Menu.TriggerButton>
      <Menu.Popup align="end">
        {workspaces.map((workspace) => (
          <Menu.Item
            key={workspace.id}
            onClick={() => onWorkspaceSelected(workspace.id)}
          >
            <HStack justify="space-between" w="full">
              <HStack>
                <EmojiOrImageIcon
                  icon={workspace.icon}
                  defaultIcon={HardDriveIcon}
                  size="sm"
                />
                <Text isTruncated maxW="250px">
                  {workspace.name}
                </Text>
                <PlanTag plan={workspace.plan} />
              </HStack>

              {workspace.id === currentWorkspace?.id && <CheckIcon />}
            </HStack>
          </Menu.Item>
        ))}
        <Menu.Item onClick={onCreateNewWorkspaceClick}>
          <PlusIcon />
          {t("workspace.dropdown.newButton.label")}
        </Menu.Item>
        <Menu.Item onClick={onLogoutClick} className="text-orange-9">
          <LogOutIcon />
          {t("workspace.dropdown.logoutButton.label")}
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
};
