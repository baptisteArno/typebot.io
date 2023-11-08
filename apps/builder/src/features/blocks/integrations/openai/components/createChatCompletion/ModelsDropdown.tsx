import { Select } from '@/components/inputs/Select'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { defaultOpenAIOptions } from '@typebot.io/schemas/features/blocks/integrations/openai/constants'

type Props = {
  baseUrl?: string
  apiVersion?: string
  credentialsId: string
  defaultValue?: string
  onChange: (model: string | undefined) => void
}

export const ModelsDropdown = ({
  baseUrl,
  apiVersion,
  defaultValue,
  onChange,
  credentialsId,
}: Props) => {
  const { workspace } = useWorkspace()
  const { showToast } = useToast()

  const { data } = trpc.openAI.listModels.useQuery(
    {
      credentialsId,
      baseUrl: baseUrl ?? defaultOpenAIOptions.baseUrl,
      workspaceId: workspace?.id as string,
      apiVersion,
    },
    {
      enabled: !!workspace,
      onError: (error) => {
        showToast({
          description: error.message,
          status: 'error',
        })
      },
    }
  )

  return (
    <Select
      items={data?.models}
      selectedItem={defaultValue}
      onSelect={onChange}
      placeholder="Select a model"
    />
  )
}
