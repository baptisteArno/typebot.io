import { Stack, Text } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { useRouter } from "next/router";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { PlusIcon } from "@/components/icons";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";

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
        variant="secondary"
        className="text-left"
        onClick={onAddClick}
        disabled={currentUserMode === "guest" || isLoading}
        {...props}
      >
        <PlusIcon />
        Add {blockDef.auth?.name}
      </Button>
    );
  }
  return (
    <Menu.Root>
      <Menu.TriggerButton variant="secondary" className="justify-between">
        <Text
          noOfLines={1}
          overflowY="visible"
          h={props.size === "sm" ? "18px" : "20px"}
        >
          {currentCredential
            ? currentCredential.name
            : `Select ${blockDef.auth?.name}`}
        </Text>
        <ArrowDown01Icon />
      </Menu.TriggerButton>
      <Menu.Popup>
        <Stack maxH={"35vh"} overflowY="auto" spacing="0">
          {data?.credentials.map((credentials) => (
            <Menu.Item
              key={credentials.id}
              onClick={handleMenuItemClick(credentials.id)}
              className="justify-between"
            >
              {credentials.name}
              <Button
                size="icon"
                className="size-7 [&_svg]:size-3"
                aria-label="Remove credentials"
                variant="secondary"
                onClick={deleteCredentials(credentials.id)}
                disabled={isDeleting === credentials.id}
              >
                <TrashIcon />
              </Button>
            </Menu.Item>
          ))}
          {currentUserMode === "guest" ? null : (
            <Menu.Item onClick={onAddClick}>
              <PlusIcon />
              {t("connectNew")}
            </Menu.Item>
          )}
        </Stack>
      </Menu.Popup>
    </Menu.Root>
  );
};
