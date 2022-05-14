import { Stack } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { TypebotLinkOptions } from 'models'
import { byId } from 'utils'
import { BlocksDropdown } from './BlocksDropdown'
import { TypebotsDropdown } from './TypebotsDropdown'

type Props = {
  options: TypebotLinkOptions
  onOptionsChange: (options: TypebotLinkOptions) => void
}

export const TypebotLinkSettingsForm = ({
  options,
  onOptionsChange,
}: Props) => {
  const { linkedTypebots, typebot } = useTypebot()

  const handleTypebotIdChange = (typebotId: string | 'current') =>
    onOptionsChange({ ...options, typebotId })
  const handleBlockIdChange = (blockId: string) =>
    onOptionsChange({ ...options, blockId })

  return (
    <Stack>
      {typebot && (
        <TypebotsDropdown
          typebotId={options.typebotId}
          onSelectTypebotId={handleTypebotIdChange}
          currentWorkspaceId={typebot.workspaceId as string}
        />
      )}
      <BlocksDropdown
        blocks={
          typebot &&
          (options.typebotId === typebot.id || options.typebotId === 'current')
            ? typebot.blocks
            : linkedTypebots?.find(byId(options.typebotId))?.blocks ?? []
        }
        blockId={options.blockId}
        onBlockIdSelected={handleBlockIdChange}
        isLoading={
          linkedTypebots === undefined &&
          typebot &&
          typebot.id !== options.typebotId
        }
      />
    </Stack>
  )
}
