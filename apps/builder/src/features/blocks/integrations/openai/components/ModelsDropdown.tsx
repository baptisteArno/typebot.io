import { Select } from "@/components/inputs/Select";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { defaultOpenAIOptions } from "@typebot.io/blocks-integrations/openai/constants";

type Props = {
  baseUrl?: string;
  apiVersion?: string;
  credentialsId: string;
  defaultValue?: string;
  type: "gpt" | "tts";
  onChange: (model: string | undefined) => void;
};

export const ModelsDropdown = ({
  baseUrl,
  apiVersion,
  defaultValue,
  onChange,
  credentialsId,
  type,
}: Props) => {
  const { workspace } = useWorkspace();

  const { data } = useQuery(
    trpc.openAI.listModels.queryOptions(
      {
        credentialsId,
        baseUrl: baseUrl ?? defaultOpenAIOptions.baseUrl,
        workspaceId: workspace?.id as string,
        apiVersion,
        type,
      },
      {
        enabled: !!workspace,
      },
    ),
  );

  return (
    <Select
      items={data?.models}
      selectedItem={defaultValue}
      onSelect={onChange}
      placeholder="Select a model"
    />
  );
};
