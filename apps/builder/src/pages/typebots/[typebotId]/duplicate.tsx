import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { HardDriveIcon } from "@/components/icons";
import { RadioButtons } from "@/components/inputs/RadioButtons";
import { PlanTag } from "@/features/billing/components/PlanTag";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import {
  Button,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";

const Page = () => {
  const { push } = useRouter();
  const { typebot } = useTypebot();
  const { workspaces } = useWorkspace();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>();
  const { mutate, status } = useMutation(
    trpc.typebot.importTypebot.mutationOptions({
      onSuccess: (data) => {
        push(`/typebots/${data.typebot.id}/edit`);
      },
    }),
  );

  const duplicateTypebot = (workspaceId: string) => {
    mutate({ workspaceId, typebot });
  };

  const updateSelectedWorkspaceId = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };

  return (
    <Stack w="full" justifyContent="center" pt="10" h="100vh">
      <Stack
        bgColor={useColorModeValue("white", "gray.900")}
        spacing={4}
        maxW="400px"
        mx="auto"
        p="6"
        rounded="lg"
        borderWidth={1}
      >
        <Text>
          Choose a workspace to duplicate <strong>{typebot?.name}</strong> in:
        </Text>
        <RadioButtons
          direction="column"
          options={workspaces?.map((workspace) => ({
            value: workspace.id,
            label: (
              <HStack w="full">
                <EmojiOrImageIcon
                  icon={workspace.icon}
                  boxSize="16px"
                  defaultIcon={HardDriveIcon}
                />
                <Text>{workspace.name}</Text>
                <PlanTag plan={workspace.plan} />
              </HStack>
            ),
          }))}
          value={selectedWorkspaceId}
          onSelect={updateSelectedWorkspaceId}
        />
        <Button
          isDisabled={!selectedWorkspaceId}
          onClick={() => duplicateTypebot(selectedWorkspaceId as string)}
          isLoading={status === "pending"}
          colorScheme="orange"
          size="sm"
        >
          Duplicate
        </Button>
      </Stack>
    </Stack>
  );
};

export default Page;
