import { Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { TypebotLinkOptions } from 'models'
import { byId } from 'utils'
import { GroupsDropdown } from './GroupsDropdown'
import { TypebotsDropdown } from './TypebotsDropdown'

type Props = {
  options: TypebotLinkOptions
  onOptionsChange: (options: TypebotLinkOptions) => void
}

export const TypebotLinkForm = ({ options, onOptionsChange }: Props) => {
  const { linkedTypebots, typebot } = useTypebot()

  const handleTypebotIdChange = (typebotId: string | 'current') =>
    onOptionsChange({ ...options, typebotId })
  const handleGroupIdChange = (groupId: string) =>
    onOptionsChange({ ...options, groupId })

  return (
    <Stack>
      {typebot && (
        <TypebotsDropdown
          typebotId={options.typebotId}
          onSelectTypebotId={handleTypebotIdChange}
          currentWorkspaceId={typebot.workspaceId as string}
        />
      )}
      <GroupsDropdown
        groups={
          typebot &&
          (options.typebotId === typebot.id || options.typebotId === 'current')
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
    </Stack>
  )
}
