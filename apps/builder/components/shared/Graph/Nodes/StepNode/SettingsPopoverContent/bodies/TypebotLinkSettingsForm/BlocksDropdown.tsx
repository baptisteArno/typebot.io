import { Input } from '@chakra-ui/react'
import { SearchableDropdown } from 'components/shared/SearchableDropdown'
import { Block } from 'models'
import { useMemo } from 'react'
import { byId } from 'utils'

type Props = {
  blocks: Block[]
  blockId?: string
  onBlockIdSelected: (blockId: string) => void
  isLoading?: boolean
}

export const BlocksDropdown = ({
  blocks,
  blockId,
  onBlockIdSelected,
  isLoading,
}: Props) => {
  const currentBlock = useMemo(
    () => blocks?.find(byId(blockId)),
    [blockId, blocks]
  )

  const handleBlockSelect = (title: string) => {
    const id = blocks?.find((b) => b.title === title)?.id
    if (id) onBlockIdSelected(id)
  }

  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!blocks || blocks.length === 0)
    return <Input value="No blocks found" isDisabled />
  return (
    <SearchableDropdown
      selectedItem={currentBlock?.title}
      items={(blocks ?? []).map((b) => b.title)}
      onValueChange={handleBlockSelect}
      placeholder={'Select a block'}
    />
  )
}
