import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { AudiencesIcon } from "@typebot.io/audiences/react/AudiencesIcon";
import { AudiencesList } from "@typebot.io/audiences/react/AudiencesList";
import { EmptyAudiencesListForm } from "@typebot.io/audiences/react/EmptyAudiencesListForm";
import { Avatar } from "@typebot.io/ui/components/Avatar";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { CreditCardIcon } from "@typebot.io/ui/icons/CreditCardIcon";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import { Settings01Icon } from "@typebot.io/ui/icons/Settings01Icon";
import { UsersIcon } from "@typebot.io/ui/icons/UsersIcon";
import { Wallet01Icon } from "@typebot.io/ui/icons/Wallet01Icon";
import type { ClientUser } from "@typebot.io/user/schemas";
import { useState } from "react";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { BillingSettingsLayout } from "@/features/billing/components/BillingSettingsLayout";
import { CredentialsSettingsForm } from "@/features/credentials/components/CredentialsSettingsForm";
import { MyAccountForm } from "@/features/user/components/MyAccountForm";
import { UserPreferencesForm } from "@/features/user/components/UserPreferencesForm";
import { orpc } from "@/lib/queryClient";
import packageJson from "../../../../../../package.json";
import { useWorkspace, type WorkspaceInApp } from "../WorkspaceProvider";
import { PeopleList } from "./PeopleList";
import { WorkspaceSettingsForm } from "./WorkspaceSettingsForm";

type Props = {
  isOpen: boolean;
  user: ClientUser;
  workspace: WorkspaceInApp;
  defaultTab?: SettingsTab;
  onClose: () => void;
};

type SettingsTab =
  | "my-account"
  | "user-settings"
  | "workspace-settings"
  | "members"
  | "billing"
  | "credentials"
  | "audiences";

export const WorkspaceSettingsDialog = ({
  isOpen,
  user,
  workspace,
  defaultTab = "my-account",
  onClose,
}: Props) => {
  const { t } = useTranslate();
  const { currentUserMode } = useWorkspace();
  const [selectedTab, setSelectedTab] = useState<SettingsTab>(defaultTab);
  const { data: featureFlags } = useQuery(
    orpc.getFeatureFlags.queryOptions({
      input: {
        workspaceId: workspace.id,
      },
    }),
  );

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="p-0 flex flex-row max-w-6xl min-h-full gap-0">
        <div className="flex flex-col gap-8 w-[250px] py-6 border-r justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 px-2">
              <p className="pl-4 text-sm" color="gray.500">
                {t("account")}
              </p>
              <Button
                variant={selectedTab === "my-account" ? "outline" : "ghost"}
                onClick={() => setSelectedTab("my-account")}
                className="justify-start pl-4"
                size="sm"
              >
                <Avatar.Root className="size-4">
                  <Avatar.Image src={user.image ?? undefined} alt="User" />
                  <Avatar.Fallback>{user.name?.charAt(0)}</Avatar.Fallback>
                </Avatar.Root>
                {user.name ?? user.email}
              </Button>
              <Button
                variant={selectedTab === "user-settings" ? "outline" : "ghost"}
                onClick={() => setSelectedTab("user-settings")}
                className="justify-start pl-4"
                size="sm"
              >
                <Settings01Icon />
                {t("workspace.settings.modal.menu.preferences.label")}
              </Button>
              <Button
                variant={selectedTab === "credentials" ? "outline" : "ghost"}
                onClick={() => setSelectedTab("credentials")}
                className="justify-start pl-4"
                size="sm"
              >
                <Wallet01Icon />
                {t("credentials")}
              </Button>
            </div>
            <div className="flex flex-col gap-2 px-2">
              <p className="pl-4 text-sm" color="gray.500">
                {t("workspace.settings.modal.menu.workspace.label")}
              </p>
              {currentUserMode === "write" && (
                <Button
                  variant={
                    selectedTab === "workspace-settings" ? "outline" : "ghost"
                  }
                  onClick={() => setSelectedTab("workspace-settings")}
                  className="justify-start pl-4"
                  size="sm"
                >
                  <EmojiOrImageIcon
                    icon={workspace.icon}
                    size="sm"
                    defaultIcon={HardDriveIcon}
                  />
                  {t("workspace.settings.modal.menu.settings.label")}
                </Button>
              )}

              {currentUserMode !== "guest" && (
                <Button
                  variant={selectedTab === "members" ? "outline" : "ghost"}
                  onClick={() => setSelectedTab("members")}
                  className="justify-start pl-4"
                  size="sm"
                >
                  <UsersIcon />
                  {t("workspace.settings.modal.menu.members.label")}
                </Button>
              )}
              {currentUserMode === "write" && (
                <Button
                  variant={selectedTab === "billing" ? "outline" : "ghost"}
                  onClick={() => setSelectedTab("billing")}
                  className="justify-start pl-4 overflow-auto"
                  size="sm"
                >
                  <CreditCardIcon />
                  {t("workspace.settings.modal.menu.billingAndUsage.label")}
                </Button>
              )}
              {currentUserMode === "write" && featureFlags?.flags.campaigns && (
                <Button
                  variant={selectedTab === "audiences" ? "outline" : "ghost"}
                  onClick={() => setSelectedTab("audiences")}
                  className="justify-start pl-4"
                  size="sm"
                >
                  <AudiencesIcon />
                  Audiences
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-10">
            <p className="text-xs" color="gray.500">
              {t("workspace.settings.modal.menu.version.label", {
                version: packageJson.version,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-1 p-10">
          <SettingsContent tab={selectedTab} onClose={onClose} />
        </div>
      </Dialog.Popup>
    </Dialog.Root>
  );
};

const AudiencesSettingsContent = () => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const { data } = useQuery(
    orpc.audiences.list.queryOptions({
      input: {
        workspaceId: workspace?.id ?? "",
      },
      enabled: !!workspace?.id,
    }),
  );
  const { mutateAsync: createAudience } = useMutation(
    orpc.audiences.create.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.audiences.list.key({
            input: { workspaceId: variables.workspaceId },
          }),
        });
      },
    }),
  );
  if (!data) return null;
  if (data.audiences.length === 0)
    return (
      <EmptyAudiencesListForm
        onCreateSubmit={async (input) => {
          if (!workspace?.id) return;
          await createAudience({
            workspaceId: workspace.id,
            name: input.name,
          });
        }}
      />
    );
  return (
    <div className="flex flex-col gap-4">
      <h2>Audiences</h2>
      <AudiencesList audiences={data.audiences} />
    </div>
  );
};

const SettingsContent = ({
  tab,
  onClose,
}: {
  tab: SettingsTab;
  onClose: () => void;
}) => {
  switch (tab) {
    case "my-account":
      return <MyAccountForm />;
    case "user-settings":
      return <UserPreferencesForm />;
    case "workspace-settings":
      return <WorkspaceSettingsForm onClose={onClose} />;
    case "members":
      return <PeopleList />;
    case "billing":
      return <BillingSettingsLayout />;
    case "credentials":
      return <CredentialsSettingsForm />;
    case "audiences":
      return <AudiencesSettingsContent />;
    default:
      return null;
  }
};
