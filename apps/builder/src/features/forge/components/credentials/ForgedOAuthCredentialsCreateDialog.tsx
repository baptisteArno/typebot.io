import { useMutation } from "@tanstack/react-query";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { useState } from "react";
import { CopyInput } from "@/components/inputs/CopyInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useOAuthPopup } from "./useOAuthPopup";

type Props = {
  blockDef: ForgedBlockDefinition;
  isOpen: boolean;
  defaultData?: any;
  scope: "workspace" | "user";
  editorContext?: {
    typebotId: string;
    blockId: string;
  };
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const ForgedOAuthCredentialsCreateDialog = ({
  blockDef,
  isOpen,
  scope,
  defaultData,
  onClose,
  onNewCredentials,
}: Props) => {
  if (blockDef.auth?.type !== "oauth") return null;
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <ForgedOAuthCredentialsCreateDialogBody
        defaultData={defaultData}
        blockDef={blockDef}
        scope={scope}
        onNewCredentials={(id) => {
          onClose();
          onNewCredentials(id);
        }}
      />
    </Dialog.Root>
  );
};

export const ForgedOAuthCredentialsDialogTitle = ({
  blockDef,
  mode,
}: {
  blockDef: ForgedBlockDefinition;
  mode: "create" | "update";
}) => {
  return (
    <Dialog.Title>
      {mode === "create" ? "Add" : "Update"} {blockDef.auth?.name}
    </Dialog.Title>
  );
};

export const ForgedOAuthCredentialsCreateDialogBody = ({
  blockDef,
  scope,
  onNewCredentials,
}: Pick<
  Props,
  "blockDef" | "onNewCredentials" | "defaultData" | "editorContext" | "scope"
>) => {
  const { workspace } = useWorkspace();
  const [name, setName] = useState("");
  const [tab, setTab] = useState<"default" | "your-app">(
    blockDef.auth && "defaultClientEnvKeys" in blockDef.auth
      ? "default"
      : "your-app",
  );
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const { mutate, isPending } = useMutation(
    trpc.credentials.createOAuthCredentials.mutationOptions({
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.credentials.listCredentials.queryKey(),
        });
        onNewCredentials(data.credentialsId);
      },
    }),
  );

  const handleOAuthSuccess = (code: string) => {
    if (!workspace) return;
    const credentials = {
      name: name.trim(),
      blockType: blockDef.id,
      code,
      customClient:
        tab === "your-app"
          ? {
              id: clientId.trim(),
              secret: clientSecret.trim(),
            }
          : undefined,
    };

    mutate(
      scope === "workspace"
        ? {
            ...credentials,
            scope: "workspace",
            workspaceId: workspace.id,
          }
        : {
            ...credentials,
            scope: "user",
          },
    );
  };

  const { openOAuthPopup, isAuthorizing } = useOAuthPopup({
    blockId: blockDef.id,
    clientId,
    workspace: workspace ?? null,
    onSuccess: handleOAuthSuccess,
  });

  if (!blockDef.auth) return null;
  return (
    <Dialog.Popup
      render={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            openOAuthPopup();
          }}
        />
      }
    >
      <Field.Root>
        <Field.Label>
          Label
          <MoreInfoTooltip>{`Choose a name to identify this ${blockDef.auth.name}`}</MoreInfoTooltip>
        </Field.Label>
        <Input onValueChange={setName} placeholder="My account" />
      </Field.Root>
      {"defaultClientEnvKeys" in blockDef.auth ? (
        <div className="flex gap-4 w-full items-center">
          <p>OAuth app</p>
          <div className="flex gap-2">
            <Button
              variant={tab === "default" ? "outline" : "ghost"}
              onClick={() => setTab("default")}
            >
              Default
            </Button>
            <Button
              variant={tab === "your-app" ? "outline" : "ghost"}
              onClick={() => setTab("your-app")}
            >
              Yours
            </Button>
          </div>
        </div>
      ) : null}
      {tab === "your-app" ? (
        <div className="flex flex-col gap-2">
          <span>Redirect URL</span>
          <CopyInput value={`${document.location.origin}/oauth/redirect`} />
          <Field.Root>
            <Field.Label>Client ID</Field.Label>
            <Input onValueChange={setClientId} />
          </Field.Root>
          <Field.Root>
            <Field.Label>Client secret</Field.Label>
            <Input type="password" onValueChange={setClientSecret} />
          </Field.Root>
        </div>
      ) : null}

      <Dialog.Footer>
        <Button
          variant="outline-secondary"
          type="submit"
          disabled={
            !name ||
            isPending ||
            (tab === "your-app" && (!clientId || !clientSecret)) ||
            isAuthorizing
          }
        >
          <blockDef.LightLogo />
          Connect
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
