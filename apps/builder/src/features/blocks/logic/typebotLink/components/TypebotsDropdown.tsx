import { HStack, IconButton, Input } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Select } from '@/components/inputs/Select'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useTypebots } from '@/features/dashboard/hooks/useTypebots'

type Props = {
  idsToExclude: string[]
  typebotId?: string | 'current'
  currentWorkspaceId: string
  onSelect: (typebotId: string | 'current' | undefined) => void
}

export const TypebotsDropdown = ({
  idsToExclude,
  typebotId,
  onSelect,
  currentWorkspaceId,
}: Props) => {
  const { query } = useRouter()
  const { showToast } = useToast()
  const { typebots, isLoading } = useTypebots({
    workspaceId: currentWorkspaceId,
    onError: (e) => showToast({ title: e.name, description: e.message }),
  })

  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!typebots || typebots.length === 0)
    return <Input value="No typebots found" isDisabled />
  return (
    <HStack>
      <Select
        selectedItem={typebotId}
        items={[
          {
            label: 'Current typebot',
            value: 'current',
          },
          ...(typebots ?? [])
            .filter((typebot) => !idsToExclude.includes(typebot.id))
            .map((typebot) => ({
              icon: (
                <EmojiOrImageIcon
                  icon={typebot.icon}
                  boxSize="18px"
                  emojiFontSize="18px"
                />
              ),
              label: typebot.name,
              value: typebot.id,
            })),
        ]}
        onSelect={onSelect}
        placeholder={'Select a typebot'}
      />
      {typebotId && typebotId !== 'current' && (
        <IconButton
          aria-label="Navigate to typebot"
          icon={<ExternalLinkIcon />}
          as={Link}
          href={`/typebots/${typebotId}/edit?parentId=${query.typebotId}`}
        />
      )}
    </HStack>
  )
}
