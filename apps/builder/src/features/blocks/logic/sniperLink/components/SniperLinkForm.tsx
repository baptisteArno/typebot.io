import { Stack } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { GroupsDropdown } from './GroupsDropdown'
import { SnipersDropdown } from './SnipersDropdown'
import { trpc } from '@/lib/trpc'
import { isNotEmpty } from '@sniper.io/lib'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { SniperLinkBlock } from '@sniper.io/schemas'
import { defaultSniperLinkOptions } from '@sniper.io/schemas/features/blocks/logic/sniperLink/constants'

type Props = {
  options: SniperLinkBlock['options']
  onOptionsChange: (options: SniperLinkBlock['options']) => void
}

export const SniperLinkForm = ({ options, onOptionsChange }: Props) => {
  const { sniper } = useSniper()

  const handleSniperIdChange = async (
    sniperId: string | 'current' | undefined
  ) => onOptionsChange({ ...options, sniperId, groupId: undefined })

  const { data: linkedSniperData } = trpc.sniper.getSniper.useQuery(
    {
      sniperId: options?.sniperId as string,
    },
    {
      enabled: isNotEmpty(options?.sniperId) && options?.sniperId !== 'current',
    }
  )

  const handleGroupIdChange = (groupId: string | undefined) =>
    onOptionsChange({ ...options, groupId })

  const updateMergeResults = (mergeResults: boolean) =>
    onOptionsChange({ ...options, mergeResults })

  const isCurrentSniperSelected =
    (sniper && options?.sniperId === sniper.id) ||
    options?.sniperId === 'current'

  return (
    <Stack>
      {sniper && (
        <SnipersDropdown
          idsToExclude={[sniper.id]}
          sniperId={options?.sniperId}
          onSelect={handleSniperIdChange}
          currentWorkspaceId={sniper.workspaceId as string}
        />
      )}
      {options?.sniperId && (
        <GroupsDropdown
          key={options.sniperId}
          groups={
            sniper && isCurrentSniperSelected
              ? sniper.groups
              : linkedSniperData?.sniper?.groups ?? []
          }
          groupId={options.groupId}
          onGroupIdSelected={handleGroupIdChange}
          isLoading={
            linkedSniperData?.sniper === undefined &&
            options.sniperId !== 'current' &&
            sniper &&
            sniper.id !== options.sniperId
          }
        />
      )}
      {!isCurrentSniperSelected && (
        <SwitchWithLabel
          label="Merge answers"
          moreInfoContent="If enabled, the answers collected in the linked sniper will be merged with the results of the current sniper."
          initialValue={
            options?.mergeResults ?? defaultSniperLinkOptions.mergeResults
          }
          onCheckChange={updateMergeResults}
        />
      )}
    </Stack>
  )
}
