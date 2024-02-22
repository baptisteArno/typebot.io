/* eslint-disable @typescript-eslint/no-explicit-any */
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { Select } from '@/components/inputs/Select'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { ForgedBlockDefinition, ForgedBlock } from '@typebot.io/forge-schemas'
import { ReactNode, useMemo } from 'react'

type Props = {
  blockDef: ForgedBlockDefinition
  defaultValue?: string
  fetcherId: string
  options: ForgedBlock['options']
  placeholder?: string
  label?: string
  helperText?: ReactNode
  moreInfoTooltip?: string
  direction?: 'row' | 'column'
  isRequired?: boolean
  width?: 'full'
  onChange: (value: string | undefined) => void
}
export const ForgeSelectInput = ({
  defaultValue,
  fetcherId,
  options,
  blockDef,
  placeholder,
  label,
  helperText,
  moreInfoTooltip,
  isRequired,
  direction = 'column',
  width,
  onChange,
}: Props) => {
  const { workspace } = useWorkspace()
  const { showToast } = useToast()

  const baseFetcher = useMemo(() => {
    const fetchers = blockDef.fetchers ?? []
    return fetchers.find((fetcher) => fetcher.id === fetcherId)
  }, [blockDef.fetchers, fetcherId])

  const actionFetcher = useMemo(() => {
    if (baseFetcher) return
    const fetchers = blockDef.actions.flatMap((action) => action.fetchers ?? [])
    return fetchers.find((fetcher) => fetcher.id === fetcherId)
  }, [baseFetcher, blockDef.actions, fetcherId])

  const { data } = trpc.forge.fetchSelectItems.useQuery(
    {
      integrationId: blockDef.id,
      options: pick(options, [
        ...(actionFetcher ? ['action'] : []),
        ...(blockDef.auth ? ['credentialsId'] : []),
        ...((baseFetcher
          ? baseFetcher.dependencies
          : actionFetcher?.dependencies) ?? []),
      ]),
      workspaceId: workspace?.id as string,
      fetcherId,
    },
    {
      enabled: !!workspace?.id && (!!baseFetcher || !!actionFetcher),
      onError: (error) => {
        showToast({
          description: error.message,
          status: 'error',
        })
      },
    }
  )

  return (
    <FormControl
      isRequired={isRequired}
      as={direction === 'column' ? Stack : HStack}
      justifyContent="space-between"
      width={label || width === 'full' ? 'full' : 'auto'}
      spacing={direction === 'column' ? 2 : 3}
    >
      {label && (
        <FormLabel mb="0" mr="0" flexShrink={0}>
          {label}{' '}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <Select
        items={data?.items}
        selectedItem={defaultValue}
        onSelect={onChange}
        placeholder={placeholder}
      />
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  )
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  if (!obj) return {} as Pick<T, K>
  const ret: any = {}
  keys.forEach((key) => {
    ret[key] = obj[key]
  })
  return ret
}
