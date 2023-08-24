import { Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { TypebotLinkOptions } from '@typebot.io/schemas'
import { GroupsDropdown } from './GroupsDropdown'
import { TypebotsDropdown } from './TypebotsDropdown'
import { trpc } from '@/lib/trpc'
import { isNotEmpty } from '@typebot.io/lib'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'

type Props = {
  options: TypebotLinkOptions
  onOptionsChange: (options: TypebotLinkOptions) => void
}

export const TypebotLinkForm = ({ options, onOptionsChange }: Props) => {
  const { typebot } = useTypebot()

  const handleTypebotIdChange = async (
    typebotId: string | 'current' | undefined
  ) => onOptionsChange({ ...options, typebotId, groupId: undefined })

  const { data: linkedTypebotData } = trpc.typebot.getTypebot.useQuery(
    {
      typebotId: options.typebotId as string,
    },
    {
      enabled: isNotEmpty(options.typebotId) && options.typebotId !== 'current',
    }
  )

  const handleGroupIdChange = (groupId: string | undefined) =>
    onOptionsChange({ ...options, groupId })

  const updateMergeResults = (mergeResults: boolean) =>
    onOptionsChange({ ...options, mergeResults })

  const isCurrentTypebotSelected =
    (typebot && options.typebotId === typebot.id) ||
    options.typebotId === 'current'

  return (
    <Stack>
      {typebot && (
        <TypebotsDropdown
          idsToExclude={[typebot.id]}
          typebotId={options.typebotId}
          onSelect={handleTypebotIdChange}
          currentWorkspaceId={typebot.workspaceId as string}
        />
      )}
      {options.typebotId && (
        <GroupsDropdown
          key={options.typebotId}
          groups={
            typebot && isCurrentTypebotSelected
              ? typebot.groups
              : linkedTypebotData?.typebot?.groups ?? []
          }
          groupId={options.groupId}
          onGroupIdSelected={handleGroupIdChange}
          isLoading={
            linkedTypebotData?.typebot === undefined &&
            options.typebotId !== 'current' &&
            typebot &&
            typebot.id !== options.typebotId
          }
        />
      )}
      {!isCurrentTypebotSelected && (
        <SwitchWithLabel
          label="Merge answers"
          moreInfoContent="If enabled, the answers collected in the linked typebot will be merged with the results of the current typebot."
          initialValue={options.mergeResults ?? true}
          onCheckChange={updateMergeResults}
        />
      )}
    </Stack>
  )
}
