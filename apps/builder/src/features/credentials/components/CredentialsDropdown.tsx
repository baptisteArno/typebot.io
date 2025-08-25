import { ChevronLeftIcon, PlusIcon } from "@/components/icons";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
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
        variant="secondary"
        className="text-left"
        onClick={onCreateNewClick}
        disabled={currentUserMode === "guest"}
      >
        <PlusIcon />
        {t("add")} {credentialsName}
      </Button>
    );
  }
  return (
    <Menu.Root>
      <Menu.TriggerButton
        variant="outline-secondary"
        className="justify-between"
      >
        {currentCredential ? currentCredential.name : defaultCredentialsLabel}
        <ChevronLeftIcon transform={"rotate(-90deg)"} />
      </Menu.TriggerButton>
      <Menu.Popup>
        {defaultCredentialLabel && (
          <Menu.Item onClick={handleMenuItemClick("default")}>
            {defaultCredentialLabel}
          </Menu.Item>
        )}
        {data?.credentials.map((credentials) => (
          <Menu.Item
            key={credentials.id}
            onClick={handleMenuItemClick(credentials.id)}
          >
            {credentials.name}
            <Button
              variant="ghost"
              aria-label={t(
                "blocks.inputs.payment.settings.credentials.removeCredentials.label",
              )}
              size="icon"
              className="size-6"
              onClick={deleteCredentials(credentials.id)}
              disabled={isDeleting === credentials.id}
            >
              <TrashIcon />
            </Button>
          </Menu.Item>
        ))}
        {currentUserMode === "guest" ? null : (
          <Menu.Item onClick={onCreateNewClick}>
            <PlusIcon />
            {t("blocks.inputs.payment.settings.credentials.connectNew.label")}
          </Menu.Item>
        )}
      </Menu.Popup>
    </Menu.Root>
  );
};
