import { HStack, IconButton, Input } from '@chakra-ui/react'
import { ExternalLinkIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useToast } from 'components/shared/hooks/useToast'
import { SearchableDropdown } from 'components/shared/SearchableDropdown'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useTypebots } from 'services/typebots'
import { byId } from 'utils'

type Props = {
  typebotId?: string | 'current'
  currentWorkspaceId: string
  onSelectTypebotId: (typebotId: string | 'current') => void
}

export const TypebotsDropdown = ({
  typebotId,
  onSelectTypebotId,
  currentWorkspaceId,
}: Props) => {
  const { query } = useRouter()
  const { showToast } = useToast()
  const { typebots, isLoading } = useTypebots({
    workspaceId: currentWorkspaceId,
    allFolders: true,
    onError: (e) => showToast({ title: e.name, description: e.message }),
  })
  const currentTypebot = useMemo(
    () => typebots?.find(byId(typebotId)),
    [typebotId, typebots]
  )

  const handleTypebotSelect = (name: string) => {
    if (name === 'Current typebot') return onSelectTypebotId('current')
    const id = typebots?.find((s) => s.name === name)?.id
    if (id) onSelectTypebotId(id)
  }

  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!typebots || typebots.length === 0)
    return <Input value="No typebots found" isDisabled />
  return (
    <HStack>
      <SearchableDropdown
        selectedItem={
          typebotId === 'current' ? 'Current typebot' : currentTypebot?.name
        }
        items={['Current typebot', ...(typebots ?? []).map((t) => t.name)]}
        onValueChange={handleTypebotSelect}
        placeholder={'Select a typebot'}
      />
      {currentTypebot?.id && (
        <IconButton
          aria-label="Navigate to typebot"
          icon={<ExternalLinkIcon />}
          as={NextChakraLink}
          href={`/typebots/${currentTypebot?.id}/edit?parentId=${query.typebotId}`}
        />
      )}
    </HStack>
  )
}
