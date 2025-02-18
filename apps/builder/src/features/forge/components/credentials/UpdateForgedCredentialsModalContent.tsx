import { TextInput } from "@/components/inputs/TextInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
} from "@chakra-ui/react";
import type { Credentials } from "@typebot.io/credentials/schemas";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type React from "react";
import { useEffect, useState } from "react";
import { ZodObjectLayout } from "../zodLayouts/ZodObjectLayout";

type Props = {
  credentialsId: string;
  blockDef: ForgedBlockDefinition;
  scope: "workspace" | "user";
  onUpdate: () => void;
};

export const UpdateForgedCredentialsModalContent = ({
  credentialsId,
  blockDef,
  onUpdate,
  scope,
}: Props) => {
  const { workspace } = useWorkspace();
  const [name, setName] = useState("");
  const [data, setData] = useState<any>();

  const [isUpdating, setIsUpdating] = useState(false);

  const { data: existingCredentials, refetch: refetchCredentials } =
    trpc.credentials.getCredentials.useQuery(
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
    );

  useEffect(() => {
    if (!existingCredentials || data) return;
    setName(existingCredentials.name);
    setData(existingCredentials.data);
  }, [data, existingCredentials]);

  const { mutate } = trpc.credentials.updateCredentials.useMutation({
    onMutate: () => setIsUpdating(true),
    onSettled: () => setIsUpdating(false),
    onError: (err) => {
      toast({
        description: err.message,
      });
    },
    onSuccess: () => {
      onUpdate();
      refetchCredentials();
    },
  });

  const updateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !blockDef.auth) return;
    mutate(
      scope === "workspace"
        ? {
            credentialsId,
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as Credentials,
            scope: "workspace",
            workspaceId: workspace.id,
          }
        : {
            scope: "user",
            credentialsId,
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as Credentials,
          },
    );
  };

  if (!blockDef.auth) return null;

  return (
    <ModalContent>
      <ModalHeader>Update {blockDef.auth.name}</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={updateCredentials}>
        <ModalBody as={Stack} spacing="6">
          <TextInput
            isRequired
            label="Label"
            moreInfoTooltip={`Choose a name to identify this ${blockDef.auth.name}`}
            defaultValue={name}
            onChange={setName}
            placeholder="My account"
            withVariableButton={false}
            debounceTimeout={0}
          />
          {data && (
            <ZodObjectLayout
              schema={blockDef.auth.schema}
              data={data}
              onDataChange={setData}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            isLoading={isUpdating}
            isDisabled={!data || Object.keys(data).length === 0}
            colorScheme="orange"
          >
            Update
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
};
