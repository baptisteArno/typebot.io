import { Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { TypebotLinkOptions } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { GroupsDropdown } from './GroupsDropdown'
import { TypebotsDropdown } from './TypebotsDropdown'

type Props = {
  options: TypebotLinkOptions
  onOptionsChange: (options: TypebotLinkOptions) => void
}

export const TypebotLinkForm = ({ options, onOptionsChange }: Props) => {
  const { linkedTypebots, typebot } = useTypebot()

  const handleTypebotIdChange = (typebotId: string | 'current' | undefined) =>
    onOptionsChange({ ...options, typebotId })
  const handleGroupIdChange = (groupId: string | undefined) =>
    onOptionsChange({ ...options, groupId })

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
          groups={
            typebot &&
            (options.typebotId === typebot.id ||
              options.typebotId === 'current')
              ? typebot.groups
              : linkedTypebots?.find(byId(options.typebotId))?.groups ?? []
          }
          groupId={options.groupId}
          onGroupIdSelected={handleGroupIdChange}
          isLoading={
            linkedTypebots === undefined &&
            typebot &&
            typebot.id !== options.typebotId
          }
        />
      )}
    </Stack>
  )
}
