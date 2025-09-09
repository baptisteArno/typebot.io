import { Avatar, Flex, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type { ClientUser } from "@typebot.io/user/schemas";
import { useState } from "react";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import {
  CreditCardIcon,
  HardDriveIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";
import { BillingSettingsLayout } from "@/features/billing/components/BillingSettingsLayout";
import { CredentialsSettingsForm } from "@/features/credentials/components/CredentialsSettingsForm";
import { MyAccountForm } from "@/features/user/components/MyAccountForm";
import { UserPreferencesForm } from "@/features/user/components/UserPreferencesForm";
import packageJson from "../../../../../../package.json";
import { useWorkspace, type WorkspaceInApp } from "../WorkspaceProvider";
import { MembersList } from "./MembersList";
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
  | "credentials";

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

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="p-0 flex flex-row max-w-6xl min-h-full gap-0">
        <Stack
          spacing={8}
          w="250px"
          py="6"
          borderRightWidth={1}
          justifyContent="space-between"
        >
          <Stack spacing={8}>
            <Stack px="2">
              <Text pl="4" color="gray.500" fontSize="sm">
                {t("account")}
              </Text>
              <Button
                variant={selectedTab === "my-account" ? "outline" : "ghost"}
                onClick={() => setSelectedTab("my-account")}
                className="justify-start pl-4"
                size="sm"
              >
                <Avatar
                  name={user.name ?? undefined}
                  src={user.image ?? undefined}
                  boxSize="15px"
                />
                {user.name ?? user.email}
              </Button>
              <Button
                variant={selectedTab === "user-settings" ? "outline" : "ghost"}
                onClick={() => setSelectedTab("user-settings")}
                className="justify-start pl-4"
                size="sm"
              >
                <SettingsIcon />
                {t("workspace.settings.modal.menu.preferences.label")}
              </Button>
              <Button
                variant={selectedTab === "credentials" ? "outline" : "ghost"}
                onClick={() => setSelectedTab("credentials")}
                className="justify-start pl-4"
                size="sm"
              >
                <WalletIcon />
                {t("credentials")}
              </Button>
            </Stack>
            <Stack px="2">
              <Text pl="4" color="gray.500" fontSize="sm">
                {t("workspace.settings.modal.menu.workspace.label")}
              </Text>
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
            </Stack>
          </Stack>

          <Flex justify="center" pt="10">
            <Text color="gray.500" fontSize="xs">
              {t("workspace.settings.modal.menu.version.label", {
                version: packageJson.version,
              })}
            </Text>
          </Flex>
        </Stack>

        <Flex flex="1" p="10">
          <SettingsContent tab={selectedTab} onClose={onClose} />
        </Flex>
      </Dialog.Popup>
    </Dialog.Root>
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
      return <MembersList />;
    case "billing":
      return <BillingSettingsLayout />;
    case "credentials":
      return <CredentialsSettingsForm />;
    default:
      return null;
  }
};
