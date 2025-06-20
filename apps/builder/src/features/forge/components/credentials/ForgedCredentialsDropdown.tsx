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
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { useRouter } from "next/router";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

type Props = Omit<ButtonProps, "type"> & {
  blockDef: ForgedBlockDefinition;
  currentCredentialsId: string | undefined;
  onAddClick: () => void;
  onCredentialsSelect: (credentialId?: string) => void;
  scope: "workspace" | "user";
};

const getAuthTypeFromBlockId = (blockId: ForgedBlockDefinition["id"]) => {
  if (blockId === "cal-com" || blockId === "qr-code")
    throw new Error("Block has no auth");
  return blockId;
};

export const ForgedCredentialsDropdown = ({
  currentCredentialsId,
  blockDef,
  onCredentialsSelect,
  onAddClick,
  scope,
  ...props
}: Props) => {
  const router = useRouter();
  const { t } = useTranslate();
  const { workspace, currentUserMode } = useWorkspace();
  const { data, refetch, isLoading } = useQuery(
    trpc.credentials.listCredentials.queryOptions(
      scope === "workspace"
        ? {
            scope: "workspace",
            workspaceId: workspace!.id,
            type: getAuthTypeFromBlockId(blockDef.id),
          }
        : {
            scope: "user",
            type: getAuthTypeFromBlockId(blockDef.id),
          },
      { enabled: !!workspace?.id },
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

  const currentCredential = data?.credentials.find(
    (c) => c.id === currentCredentialsId,
  );

  const handleMenuItemClick = useCallback(
    (credentialsId: string) => () => {
      onCredentialsSelect(credentialsId);
    },
    [onCredentialsSelect],
  );

  const clearQueryParams = useCallback(() => {
    const hasQueryParams = router.asPath.includes("?");
    if (hasQueryParams)
      router.push(router.asPath.split("?")[0], undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.credentialsId) {
      handleMenuItemClick(router.query.credentialsId.toString())();
      clearQueryParams();
    }
  }, [
    clearQueryParams,
    handleMenuItemClick,
    router.isReady,
    router.query.credentialsId,
  ]);

  const deleteCredentials =
    (credentialsId: string) => async (e: React.MouseEvent) => {
      if (!workspace) return;
      e.stopPropagation();
      mutate(
        scope === "workspace"
          ? {
              scope: "workspace",
              workspaceId: workspace.id,
              credentialsId,
            }
          : {
              scope: "user",
              credentialsId,
            },
      );
    };

  if (!data || data?.credentials.length === 0) {
    return (
      <Button
        colorScheme="gray"
        textAlign="left"
        leftIcon={<PlusIcon />}
        onClick={onAddClick}
        isDisabled={currentUserMode === "guest"}
        isLoading={isLoading}
        {...props}
      >
        Add {blockDef.auth?.name}
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
          {currentCredential
            ? currentCredential.name
            : `Select ${blockDef.auth?.name}`}
        </Text>
      </MenuButton>
      <MenuList>
        <Stack maxH={"35vh"} overflowY="auto" spacing="0">
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
                aria-label="Remove credentials"
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
              onClick={onAddClick}
            >
              {t("connectNew")}
            </MenuItem>
          )}
        </Stack>
      </MenuList>
    </Menu>
  );
};
