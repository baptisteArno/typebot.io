import { DropdownList } from "@/components/DropdownList";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { StripeLogo } from "@/components/logos/StripeLogo";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import {
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  type IconProps,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
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
import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CredentialsCreateModal } from "./CredentialsCreateModal";
import { CredentialsUpdateModal } from "./CredentialsUpdateModal";

const nonEditableTypes = ["whatsApp", "google sheets"] as const;

type CredentialsInfo = Pick<Credentials, "id" | "type" | "name">;

export const CredentialsSettingsForm = () => {
  const { t } = useTranslate();
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
      onError: (error) => {
        toast.error(error.message);
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
      <CredentialsCreateModal
        scope={selectedScope}
        creatingType={creatingType}
        onSubmit={() => {
          refetch();
          setCreatingType(undefined);
        }}
        onClose={() => setCreatingType(undefined)}
      />
      <CredentialsUpdateModal
        scope={selectedScope}
        editingCredentials={editingCredentials}
        onSubmit={() => {
          refetch();
          setEditingCredentials(undefined);
        }}
        onClose={() => setEditingCredentials(undefined)}
      />
      <HStack justifyContent="space-between">
        <HStack>
          <Heading fontSize="2xl">{t("credentials")}</Heading>
          <DropdownList
            size="sm"
            items={[
              { label: "User", value: "user" },
              { label: "Workspace", value: "workspace" },
            ]}
            currentItem={selectedScope}
            onItemSelect={(value) =>
              setSelectedScope(value as "user" | "workspace")
            }
          />
        </HStack>
        <Menu isLazy>
          <MenuButton as={Button} size="sm" leftIcon={<PlusIcon />}>
            {t("account.preferences.credentials.addButton.label")}
          </MenuButton>
          <MenuList>
            {credentialsTypes.map((type) => (
              <MenuItem
                key={type}
                icon={<CredentialsIcon type={type} boxSize="16px" />}
                onClick={() => setCreatingType(type)}
              >
                <CredentialsLabel type={type} />
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
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
                      )
                        ? undefined
                        : () =>
                            setEditingCredentials({
                              id: cred.id,
                              type: cred.type,
                            })
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

  return (
    <HStack justifyContent="space-between" py="2">
      <Text fontSize="sm">{cred.name}</Text>
      <HStack>
        {onEditClick && (
          <IconButton
            aria-label="Edit"
            icon={<EditIcon />}
            size="xs"
            onClick={onEditClick}
          />
        )}
        <Popover isLazy initialFocusRef={initialFocusRef}>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <IconButton
                  aria-label="Delete"
                  icon={<TrashIcon />}
                  size="xs"
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
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
                </PopoverBody>
                <PopoverFooter as={Flex} justifyContent="flex-end">
                  <HStack>
                    <Button ref={initialFocusRef} onClick={onClose} size="sm">
                      {t("cancel")}
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={onDeleteClick}
                      isLoading={isDeleting}
                      size="sm"
                    >
                      {t("delete")}
                    </Button>
                  </HStack>
                </PopoverFooter>
              </PopoverContent>
            </>
          )}
        </Popover>
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
