import { Flex, HStack, Tooltip, useColorModeValue } from '@chakra-ui/react'
import {
  BubbleBlockType,
  DraggableBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
} from '@typebot.io/schemas'
import { useBlockDnd } from '@/features/graph/providers/GraphDndProvider'
import React, { useEffect, useState } from 'react'
import { BlockIcon } from './BlockIcon'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { Plan } from '@typebot.io/prisma'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { BlockLabel } from './BlockLabel'
import { LockTag } from '@/features/billing/components/LockTag'

type Props = {
  type: DraggableBlockType
  tooltip?: string
  isDisabled?: boolean
  children: React.ReactNode
  onMouseDown: (e: React.MouseEvent, type: DraggableBlockType) => void
}

export const BlockCard = (
  props: Pick<Props, 'type' | 'onMouseDown'>
): JSX.Element => {
  const { workspace } = useWorkspace()

  switch (props.type) {
    case BubbleBlockType.EMBED:
      return (
        <BlockCardLayout
          {...props}
          tooltip="Embed a pdf, an iframe, a website..."
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case InputBlockType.FILE:
      return (
        <BlockCardLayout {...props} tooltip="Upload Files">
          <BlockIcon type={props.type} />
          <HStack>
            <BlockLabel type={props.type} />
            {isFreePlan(workspace) && <LockTag plan={Plan.STARTER} />}
          </HStack>
        </BlockCardLayout>
      )
    case LogicBlockType.SCRIPT:
      return (
        <BlockCardLayout {...props} tooltip="Execute Javascript code">
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case LogicBlockType.TYPEBOT_LINK:
      return (
        <BlockCardLayout {...props} tooltip="Link and jump to another typebot">
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case LogicBlockType.JUMP:
      return (
        <BlockCardLayout
          {...props}
          tooltip="Fast forward the flow to another group"
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case IntegrationBlockType.GOOGLE_SHEETS:
      return (
        <BlockCardLayout {...props} tooltip="Google Sheets">
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return (
        <BlockCardLayout {...props} tooltip="Google Analytics">
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    default:
      return (
        <BlockCardLayout {...props}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
  }
}

const BlockCardLayout = ({ type, onMouseDown, tooltip, children }: Props) => {
  const { draggedBlockType } = useBlockDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    setIsMouseDown(draggedBlockType === type)
  }, [draggedBlockType, type])

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type)

  return (
    <Tooltip label={tooltip}>
      <Flex pos="relative">
        <HStack
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.800')}
          rounded="lg"
          flex="1"
          cursor={'grab'}
          opacity={isMouseDown ? '0.4' : '1'}
          onMouseDown={handleMouseDown}
          bgColor={useColorModeValue('gray.50', 'gray.850')}
          px="4"
          py="2"
          _hover={useColorModeValue({ shadow: 'md' }, { bgColor: 'gray.800' })}
          transition="box-shadow 200ms, background-color 200ms"
        >
          {!isMouseDown ? children : null}
        </HStack>
      </Flex>
    </Tooltip>
  )
}
