import { AIIcon } from "@/components/icons";
import { CreateWithAIModal } from "@/features/ai";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { Button, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

export const CreateWithAIButton = () => {
  const { workspace } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: credentials } = useQuery(
    trpc.credentials.listCredentials.queryOptions(
      {
        scope: "workspace",
        workspaceId: workspace?.id,
        type: "openai",
      },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  const hasOpenAICredentials = Boolean(credentials?.credentials?.length);

  return (
    <>
      <Button
        variant="outline"
        w="full"
        py="8"
        fontSize="lg"
        leftIcon={
          <AIIcon
            color={useColorModeValue("green.500", "green.300")}
            boxSize="25px"
            mr="2"
          />
        }
        onClick={onOpen}
        isDisabled={!hasOpenAICredentials}
        opacity={hasOpenAICredentials ? 1 : 0.6}
        cursor={hasOpenAICredentials ? "pointer" : "not-allowed"}
        title={
          hasOpenAICredentials
            ? "Create typebot with AI"
            : "Configure OpenAI credentials to use AI generation"
        }
      >
        Create with AI
      </Button>

      <CreateWithAIModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
