import { BasicSelect } from "@/components/inputs/BasicSelect";
import { StripeLogo } from "@/components/logos/StripeLogo";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useOpenControls } from "@/hooks/useOpenControls";
import { trpc } from "@/lib/queryClient";
import {
  Divider,
  Flex,
  HStack,
  Heading,
  type IconProps,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  type TextProps,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import {
  type Credentials,
  credentialsTypes,
} from "@typebot.io/credentials/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Popover } from "@typebot.io/ui/components/Popover";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { EditIcon } from "@typebot.io/ui/icons/EditIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import React, { useMemo, useRef, useState } from "react";
import { CredentialsCreateDialog } from "./CredentialsCreateDialog";
import { CredentialsUpdateDialog } from "./CredentialsUpdateDialog";

const hiddenTypes = ["http proxy"] as const;
const nonEditableTypes = ["whatsApp", "google sheets"] as const;

type CredentialsInfo = Pick<Credentials, "id" | "type" | "name">;

export const CredentialsSettingsForm = () => {
  const { t } = useTranslate();
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
  const [isUpdateDialogOpened, setIsUpdateDialogOpened] = useState(false);
  const [creatingType, setCreatingType] = useState<Credentials["type"]>();
  const [selectedScope, setSelectedScope] = useState<"workspace" | "user">(
    "workspace",
  );
  const [editingCredentials, setEditingCredentials] = useState<{
    id: string;
    type: Credentials["type"];
  }>();
  const [deletingCredentialsId, setDeletingCredentialsId] = useState<string>();
  const { workspace } = useWorkspace();
  const { data, isLoading, refetch } = useQuery(
    trpc.credentials.listCredentials.queryOptions(
      selectedScope === "workspace"
        ? {
            scope: "workspace",
            workspaceId: workspace!.id,
          }
        : {
            scope: "user",
          },
      {
        enabled: selectedScope === "user" || !!workspace?.id,
      },
    ),
  );

  const { mutate: deleteCredentials } = useMutation(
    trpc.credentials.deleteCredentials.mutationOptions({
      onMutate: ({ credentialsId }) =>
        setDeletingCredentialsId(credentialsId as string),
      onSettled: () => {
        setDeletingCredentialsId(undefined);
      },
      onSuccess: () => {
        refetch();
      },
    }),
  );

  const credentials = useMemo(
    () =>
      data?.credentials ? groupCredentialsByType(data.credentials) : undefined,
    [data?.credentials],
  );

  return (
    <Stack spacing="6" w="full">
      <HStack justifyContent="space-between">
        <HStack>
          <Heading fontSize="2xl">{t("credentials")}</Heading>
          <BasicSelect
            size="sm"
            items={[
              { label: "User", value: "user" },
              { label: "Workspace", value: "workspace" },
            ]}
            value={selectedScope}
            onChange={(value) =>
              setSelectedScope(value as "user" | "workspace")
            }
          />
        </HStack>
        <Menu.Root>
          <Menu.TriggerButton variant="secondary">
            {t("account.preferences.credentials.addButton.label")}
            <ChevronDownIcon />
          </Menu.TriggerButton>
          <Menu.Popup>
            {credentialsTypes
              .filter(
                (type) =>
                  !hiddenTypes.includes(type as (typeof hiddenTypes)[number]),
              )
              .map((type) => (
                <Menu.Item
                  key={type}
                  onClick={() => {
                    setCreatingType(type);
                    setIsCreateDialogOpened(true);
                  }}
                >
                  <CredentialsIcon type={type} boxSize="16px" />
                  <CredentialsLabel type={type} />
                </Menu.Item>
              ))}
          </Menu.Popup>
        </Menu.Root>
      </HStack>

      {credentials && !isLoading ? (
        (Object.keys(credentials) as Credentials["type"][]).map((type) => (
          <Stack
            key={type}
            borderWidth="1px"
            borderRadius="md"
            p="4"
            spacing={4}
            data-testid={type}
          >
            <HStack spacing="3">
              <CredentialsIcon type={type} boxSize="24px" />
              <CredentialsLabel type={type} fontWeight="medium" />
            </HStack>
            <Stack>
              {credentials[type].map((cred) => (
                <Stack key={cred.id}>
                  <CredentialsItem
                    type={cred.type}
                    name={cred.name}
                    isDeleting={deletingCredentialsId === cred.id}
                    onEditClick={
                      nonEditableTypes.includes(
                        cred.type as (typeof nonEditableTypes)[number],
                      ) ||
                      hiddenTypes.includes(
                        cred.type as (typeof hiddenTypes)[number],
                      )
                        ? undefined
                        : () => {
                            setEditingCredentials({
                              id: cred.id,
                              type: cred.type,
                            });
                            setIsUpdateDialogOpened(true);
                          }
                    }
                    onDeleteClick={() =>
                      deleteCredentials(
                        selectedScope === "workspace"
                          ? {
                              scope: "workspace",
                              workspaceId: workspace!.id,
                              credentialsId: cred.id,
                            }
                          : { scope: "user", credentialsId: cred.id },
                      )
                    }
                  />
                  <Divider />
                </Stack>
              ))}
            </Stack>
          </Stack>
        ))
      ) : (
        <Stack borderRadius="md" spacing="6">
          <Stack spacing={4}>
            <SkeletonCircle />
            <Stack>
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          </Stack>
          <Stack spacing={4}>
            <SkeletonCircle />
            <Stack>
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          </Stack>
          <Stack spacing={4}>
            <SkeletonCircle />
            <Stack>
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          </Stack>
          <Stack spacing={4}>
            <SkeletonCircle />
            <Stack>
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          </Stack>
        </Stack>
      )}
      <CredentialsCreateDialog
        scope={selectedScope}
        type={creatingType}
        onSubmit={() => {
          refetch();
          setCreatingType(undefined);
          setIsCreateDialogOpened(false);
        }}
        isOpen={isCreateDialogOpened}
        onClose={() => setIsCreateDialogOpened(false)}
      />
      <CredentialsUpdateDialog
        scope={selectedScope}
        editingCredentials={editingCredentials}
        onSubmit={() => {
          refetch();
          setEditingCredentials(undefined);
          setIsUpdateDialogOpened(false);
        }}
        isOpen={isUpdateDialogOpened}
        onClose={() => setIsUpdateDialogOpened(false)}
      />
    </Stack>
  );
};

const CredentialsIcon = ({
  type,
  ...props
}: { type: Credentials["type"] } & IconProps) => {
  switch (type) {
    case "google sheets":
      return <BlockIcon type={IntegrationBlockType.GOOGLE_SHEETS} {...props} />;
    case "smtp":
      return <BlockIcon type={IntegrationBlockType.EMAIL} {...props} />;
    case "stripe":
      return <StripeLogo rounded="sm" {...props} />;
    case "whatsApp":
      return <WhatsAppLogo {...props} />;
    case "http proxy":
      return null;
    default:
      return <BlockIcon type={type} {...props} />;
  }
};

const CredentialsLabel = ({
  type,
  ...props
}: { type: Credentials["type"] } & TextProps) => {
  switch (type) {
    case "google sheets":
      return (
        <Text fontSize="sm" {...props}>
          Google Sheets
        </Text>
      );
    case "smtp":
      return (
        <Text fontSize="sm" {...props}>
          SMTP
        </Text>
      );
    case "stripe":
      return (
        <Text fontSize="sm" {...props}>
          Stripe
        </Text>
      );
    case "whatsApp":
      return (
        <Text fontSize="sm" {...props}>
          WhatsApp
        </Text>
      );
    case "http proxy":
      return null;
    default:
      return <BlockLabel type={type} {...props} />;
  }
};

const CredentialsItem = ({
  isDeleting,
  onEditClick,
  onDeleteClick,
  ...cred
}: Pick<Credentials, "name" | "type"> & {
  isDeleting: boolean;
  onEditClick?: () => void;
  onDeleteClick: () => void;
}) => {
  const { t } = useTranslate();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const deletePopoverControls = useOpenControls();

  return (
    <HStack justifyContent="space-between" py="2">
      <Text fontSize="sm">{cred.name}</Text>
      <HStack>
        {onEditClick && (
          <Button
            aria-label="Edit"
            className="size-7"
            size="icon"
            variant="secondary"
            onClick={onEditClick}
          >
            <EditIcon />
          </Button>
        )}
        <Popover.Root {...deletePopoverControls}>
          <Popover.TriggerButton
            aria-label="Delete"
            variant="secondary"
            size="icon"
            className="size-7"
          >
            <TrashIcon />
          </Popover.TriggerButton>
          <Popover.Popup initialFocus={initialFocusRef}>
            <Stack spacing="2">
              <Text fontSize="sm" fontWeight="medium">
                {t("confirmModal.defaultTitle")}
              </Text>
              <Text fontSize="sm">
                {t(
                  "account.preferences.credentials.deleteButton.confirmMessage",
                )}
              </Text>
            </Stack>
            <Flex justifyContent="flex-end">
              <HStack>
                <Button
                  ref={initialFocusRef}
                  onClick={deletePopoverControls.onClose}
                  size="sm"
                  variant="secondary"
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDeleteClick}
                  disabled={isDeleting}
                  size="sm"
                >
                  {t("delete")}
                </Button>
              </HStack>
            </Flex>
          </Popover.Popup>
        </Popover.Root>
      </HStack>
    </HStack>
  );
};

const groupCredentialsByType = (
  credentials: CredentialsInfo[],
): Record<CredentialsInfo["type"], CredentialsInfo[]> => {
  const groupedCredentials = {} as {
    [key in CredentialsInfo["type"]]: CredentialsInfo[];
  };
  credentials.forEach((cred) => {
    if (!groupedCredentials[cred.type]) {
      groupedCredentials[cred.type] = [];
    }
    groupedCredentials[cred.type].push(cred);
  });
  return groupedCredentials;
};
