import {
  MenuList,
  MenuItem,
  useDisclosure,
  Menu,
  MenuButton,
  HStack,
  Text,
} from '@chakra-ui/react'
import { RepeatIcon, ChevronRightIcon } from '@/components/icons'
import { useDebouncedCallback } from 'use-debounce'
import { useForgedBlock } from '@/features/forge/hooks/useForgedBlock'
import { ForgedBlockIcon } from '@/features/forge/ForgedBlockIcon'
import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { TurnableIntoParam } from '@typebot.io/forge'
import { ZodObject } from 'zod'
import { BlockV6 } from '@typebot.io/schemas'

type Props = {
  block: BlockV6
  onTurnIntoClick: (
    params: TurnableIntoParam,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    blockSchema: ZodObject<any>
  ) => void
}

export const ForgedBlockTurnIntoMenu = ({ block, onTurnIntoClick }: Props) => {
  const { actionDef } = useForgedBlock(
    block.type,
    'options' in block ? block.options?.action : undefined
  )
  const { onClose, onOpen, isOpen } = useDisclosure()
  const debounceSubMenuClose = useDebouncedCallback(onClose, 200)

  const handleMouseEnter = () => {
    debounceSubMenuClose.cancel()
    onOpen()
  }

  if (
    !actionDef ||
    !actionDef?.turnableInto ||
    actionDef?.turnableInto.length === 0
  )
    return null
  return (
    <Menu isOpen={isOpen} placement="right" offset={[0, 0]} onClose={onClose}>
      <MenuButton
        as={MenuItem}
        onClick={onOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={debounceSubMenuClose}
        icon={<RepeatIcon />}
      >
        <HStack justifyContent="space-between">
          <Text>Turn into</Text>
          <ChevronRightIcon />
        </HStack>
      </MenuButton>
      <MenuList
        onMouseEnter={handleMouseEnter}
        onMouseLeave={debounceSubMenuClose}
      >
        {actionDef.turnableInto.map((params) => (
          <TurnIntoMenuItem
            key={params.blockId}
            blockType={params.blockId as ForgedBlock['type']}
            onClick={(blockSchema) => onTurnIntoClick(params, blockSchema)}
          />
        ))}
      </MenuList>
    </Menu>
  )
}

const TurnIntoMenuItem = ({
  blockType,
  onClick,
}: {
  blockType: ForgedBlock['type']
  onClick: (blockSchema: ZodObject<any>) => void
}) => {
  const { blockDef, blockSchema } = useForgedBlock(blockType)

  if (!blockDef || !blockSchema) return null
  return (
    <MenuItem
      icon={<ForgedBlockIcon type={blockType} />}
      onClick={() => onClick(blockSchema)}
    >
      {blockDef.name}
    </MenuItem>
  )
}
