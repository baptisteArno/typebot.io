import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { BlockIndices, BlockV6 } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'
import { ForgedBlockTurnIntoMenu } from '@/features/forge/components/ForgedBlockTurnIntoMenu'
import { TurnableIntoParam } from '@typebot.io/forge'
import { ZodObject } from 'zod'

type Props = {
  indices: BlockIndices
  block: BlockV6
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onTurnIntoClick: (params: TurnableIntoParam, schema: ZodObject<any>) => void
}

export const BlockNodeContextMenu = ({
  indices,
  block,
  onTurnIntoClick,
}: Props) => {
  const { t } = useTranslate()
  const { deleteBlock, duplicateBlock } = useTypebot()

  const handleDuplicateClick = () => duplicateBlock(indices)

  const handleDeleteClick = () => deleteBlock(indices)

  return (
    <MenuList>
      <ForgedBlockTurnIntoMenu
        block={block}
        onTurnIntoClick={onTurnIntoClick}
      />
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        {t('duplicate')}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        {t('delete')}
      </MenuItem>
    </MenuList>
  )
}
