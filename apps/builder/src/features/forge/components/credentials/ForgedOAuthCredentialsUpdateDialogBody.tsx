import { useMutation, useQuery } from "@tanstack/react-query";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { useEffect, useState } from "react";
import { CopyInput } from "@/components/inputs/CopyInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useOAuthPopup } from "./useOAuthPopup";

type Props = {
  credentialsId: string;
  blockDef: ForgedBlockDefinition;
  scope: "workspace" | "user";
  onUpdate: () => void;
};

export const ForgedOAuthCredentialsUpdateDialogBody = ({
  credentialsId,
  blockDef,
  scope,
  onUpdate,
}: Props) => {
  const { workspace } = useWorkspace();

  const [name, setName] = useState("");
  const [tab, setTab] = useState<"default" | "your-app">(
    blockDef.auth && "defaultClientEnvKeys" in blockDef.auth
      ? "default"
      : "your-app",
  );
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const { data: existingCredentials } = useQuery(
    trpc.credentials.getCredentials.queryOptions(
      scope === "workspace"
        ? {
            scope: "workspace",
            workspaceId: workspace?.id as string,
            credentialsId,
          }
        : {
            scope: "user",
            credentialsId,
          },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  useEffect(() => {
    if (!existingCredentials) return;
    if (name !== "" || clientId !== "" || clientSecret !== "") return;
    setName(existingCredentials.name);
    if (
      "client" in existingCredentials.data &&
      existingCredentials.data.client
    ) {
      const client = existingCredentials.data.client as {
        id: string;
        secret: string;
      };
      setClientId(client.id);
      setClientSecret(client.secret);
      setTab("your-app");
    }
  }, [existingCredentials, clientId, clientSecret, name]);

  const { mutate, isPending } = useMutation(
    trpc.credentials.updateOAuthCredentials.mutationOptions({
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: (_data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.credentials.listCredentials.queryKey(),
        });
        onUpdate();
      },
    }),
  );

  const handleOAuthSuccess = (code: string) => {
    if (!workspace) return;
    mutate({
      name,
      blockType: blockDef.id,
      workspaceId: workspace.id,
      credentialsId,
      code,
      customClient:
        tab === "your-app"
          ? {
              id: clientId,
              secret: clientSecret,
            }
          : undefined,
    });
  };

  const { openOAuthPopup, isAuthorizing } = useOAuthPopup({
    blockId: blockDef.id,
    clientId,
    workspace: workspace ?? null,
    onSuccess: handleOAuthSuccess,
  });

  if (!blockDef.auth) return null;
  return (
    <Dialog.Popup>
      <Dialog.Title>Add {blockDef.auth.name}</Dialog.Title>
      <Dialog.CloseButton />
      <Field.Root>
        <Field.Label>
          Label
          <MoreInfoTooltip>{`Choose a name to identify this ${blockDef.auth.name}`}</MoreInfoTooltip>
        </Field.Label>
        <Input
          onValueChange={setName}
          defaultValue={name}
          placeholder="My account"
        />
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
            <Input onValueChange={setClientId} defaultValue={clientId} />
          </Field.Root>
          <Field.Root>
            <Field.Label>Client secret</Field.Label>
            <Input
              type="password"
              onValueChange={setClientSecret}
              defaultValue={clientSecret}
            />
          </Field.Root>
        </div>
      ) : null}

      <Dialog.Footer>
        <Button
          variant="outline-secondary"
          onClick={openOAuthPopup}
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
