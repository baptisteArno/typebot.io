import { EditIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { StripeLogo } from "@/components/logos/StripeLogo";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/trpc";
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
  const [creatingType, setCreatingType] = useState<Credentials["type"]>();
  const [editingCredentials, setEditingCredentials] = useState<{
    id: string;
    type: Credentials["type"];
  }>();
  const [deletingCredentialsId, setDeletingCredentialsId] = useState<string>();
  const { workspace } = useWorkspace();
  const { data, isLoading, refetch } =
    trpc.credentials.listCredentials.useQuery(
      {
        workspaceId: workspace!.id,
      },
      {
        enabled: !!workspace?.id,
      },
    );

  const { mutate: deleteCredentials } =
    trpc.credentials.deleteCredentials.useMutation({
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
    });

  const credentials = useMemo(
    () =>
      data?.credentials ? groupCredentialsByType(data.credentials) : undefined,
    [data?.credentials],
  );

  return (
    <Stack spacing="6" w="full">
      <CredentialsCreateModal
        creatingType={creatingType}
        onSubmit={() => {
          refetch();
          setCreatingType(undefined);
        }}
        onClose={() => setCreatingType(undefined)}
      />
      <CredentialsUpdateModal
        editingCredentials={editingCredentials}
        onSubmit={() => {
          refetch();
          setEditingCredentials(undefined);
        }}
        onClose={() => setEditingCredentials(undefined)}
      />
      <HStack justifyContent="space-between">
        <Heading fontSize="2xl">Credentials</Heading>
        <Menu isLazy>
          <MenuButton as={Button} size="sm" leftIcon={<PlusIcon />}>
            Create new
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
              <CredentialsLabel type={type} fontWeight="semibold" />
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
                      deleteCredentials({
                        workspaceId: workspace!.id,
                        credentialsId: cred.id,
                      })
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
                    <Text fontSize="sm" fontWeight="semibold">
                      Are you sure?
                    </Text>
                    <Text fontSize="sm">
                      Make sure this credentials is not used in any of your
                      published bot before proceeding.
                    </Text>
                  </Stack>
                </PopoverBody>
                <PopoverFooter as={Flex} justifyContent="flex-end">
                  <HStack>
                    <Button ref={initialFocusRef} onClick={onClose} size="sm">
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={onDeleteClick}
                      isLoading={isDeleting}
                      size="sm"
                    >
                      Delete
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedCredentials: any = {};
  credentials.forEach((cred) => {
    if (!groupedCredentials[cred.type]) {
      groupedCredentials[cred.type] = [];
    }
    groupedCredentials[cred.type].push(cred);
  });
  return groupedCredentials;
};
