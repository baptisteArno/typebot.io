import { Select } from '@/components/inputs/Select'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'

type Props = {
  credentialsId: string
  blockId: string
  defaultValue: string
  onChange: (model: string | undefined) => void
}

export const ModelsDropdown = ({
  defaultValue,
  onChange,
  credentialsId,
  blockId,
}: Props) => {
  const { typebot } = useTypebot()
  const { workspace } = useWorkspace()

  const { data } = trpc.openAI.listModels.useQuery(
    {
      credentialsId,
      blockId,
      typebotId: typebot?.id as string,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!typebot && !!workspace,
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
