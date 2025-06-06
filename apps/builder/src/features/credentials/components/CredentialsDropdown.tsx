import { ChevronLeftIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Button,
  type ButtonProps,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { Credentials } from "@typebot.io/credentials/schemas";
import type React from "react";
import { useCallback, useState } from "react";

type Props = Omit<ButtonProps, "type"> & {
  type: Credentials["type"];
  scope:
    | {
        type: "workspace";
        workspaceId: string;
      }
    | {
        type: "user";
        userId: string;
      };
  currentCredentialsId: string | undefined;
  onCredentialsSelect: (credentialId?: string) => void;
  onCreateNewClick: () => void;
  defaultCredentialLabel?: string;
  credentialsName: string;
};

export const CredentialsDropdown = ({
  currentCredentialsId,
  onCredentialsSelect,
  onCreateNewClick,
  defaultCredentialLabel,
  credentialsName,
  type,
  scope,
  ...props
}: Props) => {
  const { t } = useTranslate();
  const { currentUserMode } = useWorkspace();
  const { data, refetch } = useQuery(
    trpc.credentials.listCredentials.queryOptions(
      scope.type === "workspace"
        ? {
            scope: "workspace",
            workspaceId: scope.workspaceId,
            type: type,
          }
        : {
            scope: "user",
            type,
          },
    ),
  );
  const [isDeleting, setIsDeleting] = useState<string>();
  const { mutate } = useMutation(
    trpc.credentials.deleteCredentials.mutationOptions({
      onMutate: ({ credentialsId }) => {
        setIsDeleting(credentialsId);
      },
      onError: (error) => {
        toast({
          description: error.message,
        });
      },
      onSuccess: ({ credentialsId }) => {
        if (credentialsId === currentCredentialsId)
          onCredentialsSelect(undefined);
        refetch();
      },
      onSettled: () => {
        setIsDeleting(undefined);
      },
    }),
  );

  const defaultCredentialsLabel =
    defaultCredentialLabel ?? `${t("select")} ${credentialsName}`;

  const currentCredential = data?.credentials.find(
    (c) => c.id === currentCredentialsId,
  );

  const handleMenuItemClick = useCallback(
    (credentialsId: string) => () => {
      onCredentialsSelect(credentialsId);
    },
    [onCredentialsSelect],
  );

  const deleteCredentials =
    (credentialsId: string) => async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (scope.type === "workspace")
        mutate({
          scope: "workspace",
          workspaceId: scope.workspaceId,
          credentialsId,
        });
      else mutate({ scope: "user", credentialsId });
    };

  if (data?.credentials.length === 0 && !defaultCredentialLabel) {
    return (
      <Button
        colorScheme="gray"
        textAlign="left"
        leftIcon={<PlusIcon />}
        onClick={onCreateNewClick}
        isDisabled={currentUserMode === "guest"}
        {...props}
      >
        {t("add")} {credentialsName}
      </Button>
    );
  }
  return (
    <Menu isLazy>
      <MenuButton
        as={Button}
        rightIcon={<ChevronLeftIcon transform={"rotate(-90deg)"} />}
        colorScheme="gray"
        justifyContent="space-between"
        textAlign="left"
        {...props}
      >
        <Text
          noOfLines={1}
          overflowY="visible"
          h={props.size === "sm" ? "18px" : "20px"}
        >
          {currentCredential ? currentCredential.name : defaultCredentialsLabel}
        </Text>
      </MenuButton>
      <MenuList>
        <Stack maxH={"35vh"} overflowY="auto" spacing="0">
          {defaultCredentialLabel && (
            <MenuItem
              maxW="500px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              onClick={handleMenuItemClick("default")}
            >
              {defaultCredentialLabel}
            </MenuItem>
          )}
          {data?.credentials.map((credentials) => (
            <MenuItem
              role="menuitem"
              minH="40px"
              key={credentials.id}
              onClick={handleMenuItemClick(credentials.id)}
              fontSize="16px"
              fontWeight="normal"
              rounded="none"
              justifyContent="space-between"
            >
              {credentials.name}
              <IconButton
                icon={<TrashIcon />}
                aria-label={t(
                  "blocks.inputs.payment.settings.credentials.removeCredentials.label",
                )}
                size="xs"
                onClick={deleteCredentials(credentials.id)}
                isLoading={isDeleting === credentials.id}
              />
            </MenuItem>
          ))}
          {currentUserMode === "guest" ? null : (
            <MenuItem
              maxW="500px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              icon={<PlusIcon />}
              onClick={onCreateNewClick}
            >
              {t("blocks.inputs.payment.settings.credentials.connectNew.label")}
            </MenuItem>
          )}
        </Stack>
      </MenuList>
    </Menu>
  );
};
