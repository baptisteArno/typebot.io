import { TextInput } from "@/components/inputs/TextInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import type { CreatableCredentials } from "@typebot.io/credentials/schemas";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { z } from "@typebot.io/zod";
import { useState } from "react";
import { ZodObjectLayout } from "../zodLayouts/ZodObjectLayout";

type Props = {
  blockDef: ForgedBlockDefinition;
  isOpen: boolean;
  defaultData?: any;
  scope: "workspace" | "user";
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const ForgedCredentialsCreateDialog = ({
  blockDef,
  isOpen,
  defaultData,
  scope,
  onClose,
  onNewCredentials,
}: Props) => {
  if (!blockDef.auth) return null;
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <ForgedCredentialsCreateDialogBody
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

export const ForgedCredentialsCreateDialogTitle = ({
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

export const ForgedCredentialsCreateDialogBody = ({
  blockDef,
  onNewCredentials,
  scope,
}: Pick<Props, "blockDef" | "onNewCredentials" | "defaultData" | "scope">) => {
  const { workspace } = useWorkspace();
  const [name, setName] = useState("");
  const [data, setData] = useState({});

  const [isCreating, setIsCreating] = useState(false);

  const { mutate } = useMutation(
    trpc.credentials.createCredentials.mutationOptions({
      onMutate: () => setIsCreating(true),
      onSettled: () => setIsCreating(false),
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

  const createForgedCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !blockDef.auth) return;
    mutate(
      scope === "workspace"
        ? {
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as CreatableCredentials,
            scope: "workspace",
            workspaceId: workspace.id,
          }
        : {
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as CreatableCredentials,
            scope: "user",
          },
    );
  };

  if (!blockDef.auth) return null;
  return (
    <Dialog.Popup render={<form onSubmit={createForgedCredentials} />}>
      <Dialog.Title>Add {blockDef.auth.name}</Dialog.Title>
      <TextInput
        label="Label"
        moreInfoTooltip={`Choose a name to identify this ${blockDef.auth.name}`}
        onChange={setName}
        placeholder="My account"
        withVariableButton={false}
        debounceTimeout={0}
      />
      <ZodObjectLayout
        schema={
          blockDef.auth.type === "encryptedCredentials"
            ? blockDef.auth.schema
            : z.object({})
        }
        data={data}
        onDataChange={setData}
      />

      <Dialog.Footer>
        <Button
          type="submit"
          disabled={isCreating || Object.keys(data).length === 0}
        >
          Create
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
