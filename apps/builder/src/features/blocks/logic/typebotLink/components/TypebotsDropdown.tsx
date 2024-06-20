import { HStack, IconButton, Input } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Select } from '@/components/inputs/Select'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useSnipers } from '@/features/dashboard/hooks/useSnipers'

type Props = {
  idsToExclude: string[]
  sniperId?: string | 'current'
  currentWorkspaceId: string
  onSelect: (sniperId: string | 'current' | undefined) => void
}

export const SnipersDropdown = ({
  idsToExclude,
  sniperId,
  onSelect,
  currentWorkspaceId,
}: Props) => {
  const { query } = useRouter()
  const { showToast } = useToast()
  const { snipers, isLoading } = useSnipers({
    workspaceId: currentWorkspaceId,
    onError: (e) => showToast({ title: e.name, description: e.message }),
  })

  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!snipers || snipers.length === 0)
    return <Input value="No snipers found" isDisabled />
  return (
    <HStack>
      <Select
        selectedItem={sniperId}
        items={[
          {
            label: 'Current sniper',
            value: 'current',
          },
          ...(snipers ?? [])
            .filter((sniper) => !idsToExclude.includes(sniper.id))
            .map((sniper) => ({
              icon: (
                <EmojiOrImageIcon
                  icon={sniper.icon}
                  boxSize="18px"
                  emojiFontSize="18px"
                />
              ),
              label: sniper.name,
              value: sniper.id,
            })),
        ]}
        onSelect={onSelect}
        placeholder={'Select a sniper'}
      />
      {sniperId && sniperId !== 'current' && (
        <IconButton
          aria-label="Navigate to sniper"
          icon={<ExternalLinkIcon />}
          as={Link}
          href={{
            pathname: '/snipers/[sniperId]/edit',
            query: {
              sniperId,
              parentId: query.parentId
                ? Array.isArray(query.parentId)
                  ? query.parentId.concat(query.sniperId?.toString() ?? '')
                  : [query.parentId, query.sniperId?.toString() ?? '']
                : query.sniperId ?? [],
            },
          }}
        />
      )}
    </HStack>
  )
}
