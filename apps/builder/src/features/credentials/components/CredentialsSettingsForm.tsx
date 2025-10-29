import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import {
  type Credentials,
  credentialsTypes,
} from "@typebot.io/credentials/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { Edit03Icon } from "@typebot.io/ui/icons/Edit03Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { type SVGProps, useMemo, useRef, useState } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { StripeLogo } from "@/components/logos/StripeLogo";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
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
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2>{t("credentials")}</h2>
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
        </div>
        <Menu.Root>
          <Menu.TriggerButton variant="secondary">
            {t("account.preferences.credentials.addButton.label")}
            <ArrowDown01Icon />
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
                  <CredentialsIcon type={type} className="size-4" />
                  <CredentialsLabel type={type} />
                </Menu.Item>
              ))}
          </Menu.Popup>
        </Menu.Root>
      </div>
      {credentials && !isLoading ? (
        (Object.keys(credentials) as Credentials["type"][]).map((type) => (
          <div
            className="flex flex-col border rounded-md p-4 gap-4"
            key={type}
            data-testid={type}
          >
            <div className="flex items-center gap-3">
              <CredentialsIcon type={type} className="size-6" />
              <CredentialsLabel type={type} className="font-medium" />
            </div>
            <div className="flex flex-col gap-2">
              {credentials[type].map((cred) => (
                <div className="flex flex-col gap-2" key={cred.id}>
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
                  <hr className="border-gray-3" />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col rounded-md gap-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </div>
          </div>
        </div>
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
    </div>
  );
};

const CredentialsIcon = ({
  type,
  ...props
}: { type: Credentials["type"] } & SVGProps<SVGSVGElement>) => {
  switch (type) {
    case "google sheets":
      return <BlockIcon type={IntegrationBlockType.GOOGLE_SHEETS} {...props} />;
    case "smtp":
      return <BlockIcon type={IntegrationBlockType.EMAIL} {...props} />;
    case "stripe":
      return <StripeLogo {...props} />;
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
  className,
}: {
  type: Credentials["type"];
  className?: string;
}) => {
  switch (type) {
    case "google sheets":
      return <p className={cn("text-sm", className)}>Google Sheets</p>;
    case "smtp":
      return <p className={cn("text-sm", className)}>SMTP</p>;
    case "stripe":
      return <p className={cn("text-sm", className)}>Stripe</p>;
    case "whatsApp":
      return <p className={cn("text-sm", className)}>WhatsApp</p>;
    case "http proxy":
      return null;
    default:
      return <BlockLabel type={type} className={className} />;
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
    <div className="flex items-center gap-2 justify-between py-2">
      <p className="text-sm">{cred.name}</p>
      <div className="flex items-center gap-2">
        {onEditClick && (
          <Button
            aria-label="Edit"
            className="size-7"
            size="icon"
            variant="secondary"
            onClick={onEditClick}
          >
            <Edit03Icon />
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
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                {t("confirmModal.defaultTitle")}
              </p>
              <p className="text-sm">
                {t(
                  "account.preferences.credentials.deleteButton.confirmMessage",
                )}
              </p>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </Popover.Popup>
        </Popover.Root>
      </div>
    </div>
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
