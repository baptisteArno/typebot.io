import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import { LogoutSquare02Icon } from "@typebot.io/ui/icons/LogoutSquare02Icon";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { PlanBadge } from "@/features/billing/components/PlanTag";
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
        <div className="flex items-center gap-2">
          {!isLoggingOut && currentWorkspace && (
            <>
              <p className="max-w-[300px] truncate">{currentWorkspace.name}</p>
              <PlanBadge plan={currentWorkspace.plan} />
            </>
          )}
          <ArrowDown01Icon />
        </div>
      </Menu.TriggerButton>
      <Menu.Popup align="end">
        {workspaces.map((workspace) => (
          <Menu.Item
            key={workspace.id}
            onClick={() => onWorkspaceSelected(workspace.id)}
          >
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="flex items-center gap-2">
                <EmojiOrImageIcon
                  icon={workspace.icon}
                  defaultIcon={HardDriveIcon}
                  size="sm"
                />
                <p className="max-w-[250px] truncate">{workspace.name}</p>
                <PlanBadge plan={workspace.plan} />
              </div>

              {workspace.id === currentWorkspace?.id && <TickIcon />}
            </div>
          </Menu.Item>
        ))}
        <Menu.Item onClick={onCreateNewWorkspaceClick}>
          <PlusSignIcon />
          {t("workspace.dropdown.newButton.label")}
        </Menu.Item>
        <Menu.Item onClick={onLogoutClick} className="text-orange-9">
          <LogoutSquare02Icon />
          {t("workspace.dropdown.logoutButton.label")}
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
};
