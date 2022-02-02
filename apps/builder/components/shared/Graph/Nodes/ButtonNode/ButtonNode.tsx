import {
  EditablePreview,
  EditableInput,
  Editable,
  useEventListener,
  Flex,
  Fade,
  IconButton,
} from '@chakra-ui/react'
import { PlusIcon } from 'assets/icons'
import { ContextMenu } from 'components/shared/ContextMenu'
import { Coordinates } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ChoiceInputStep, ChoiceItem } from 'models'
import React, { useState } from 'react'
import { isNotDefined, isSingleChoiceInput } from 'utils'
import { SourceEndpoint } from '../../Endpoints/SourceEndpoint'
import { ButtonNodeContextMenu } from './ButtonNodeContextMenu'

type Props = {
  item: ChoiceItem
  onMouseMoveBottomOfElement?: () => void
  onMouseMoveTopOfElement?: () => void
  onMouseDown?: (
    stepNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: ChoiceItem
  ) => void
}

export const ButtonNode = ({
  item,
  onMouseDown,
  onMouseMoveBottomOfElement,
  onMouseMoveTopOfElement,
}: Props) => {
  const { deleteChoiceItem, updateChoiceItem, typebot, createChoiceItem } =
    useTypebot()
  const [mouseDownEvent, setMouseDownEvent] =
    useState<{ absolute: Coordinates; relative: Coordinates }>()
  const [isMouseOver, setIsMouseOver] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onMouseDown) return
    e.stopPropagation()
    const element = e.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top
    setMouseDownEvent({
      absolute: { x: e.clientX + relativeX, y: e.clientY + relativeY },
      relative: { x: relativeX, y: relativeY },
    })
  }

  const handleGlobalMouseUp = () => {
    setMouseDownEvent(undefined)
  }
  useEventListener('mouseup', handleGlobalMouseUp)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onMouseMoveBottomOfElement || !onMouseMoveTopOfElement) return
    const isMovingAndIsMouseDown =
      mouseDownEvent &&
      onMouseDown &&
      (event.movementX > 0 || event.movementY > 0)
    if (isMovingAndIsMouseDown) {
      onMouseDown(mouseDownEvent, item)
      deleteChoiceItem(item.id)
      setMouseDownEvent(undefined)
    }
    const element = event.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    if (y > rect.height / 2) onMouseMoveBottomOfElement()
    else onMouseMoveTopOfElement()
  }

  const handleInputSubmit = (content: string) =>
    updateChoiceItem(item.id, { content: content === '' ? undefined : content })

  const handlePlusClick = () => {
    const nextIndex =
      (
        typebot?.steps.byId[item.stepId] as ChoiceInputStep
      ).options.itemIds.indexOf(item.id) + 1
    createChoiceItem({ stepId: item.stepId }, nextIndex)
  }

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <ButtonNodeContextMenu itemId={item.id} />}
    >
      {(ref, isOpened) => (
        <Flex
          ref={ref}
          align="center"
          pos="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          justifyContent="center"
          shadow="sm"
          _hover={{ shadow: 'md' }}
          transition="box-shadow 200ms"
          borderWidth="1px"
          rounded="md"
          px="4"
          py="2"
          borderColor={isOpened ? 'blue.400' : 'gray.300'}
        >
          <Editable
            defaultValue={item.content ?? 'Click to edit'}
            flex="1"
            startWithEditView={isNotDefined(item.content)}
            onSubmit={handleInputSubmit}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <EditablePreview
              w="full"
              color={item.content !== 'Click to edit' ? 'inherit' : 'gray.500'}
            />
            <EditableInput />
          </Editable>
          {typebot && isSingleChoiceInput(typebot.steps.byId[item.stepId]) && (
            <SourceEndpoint
              source={{
                blockId: typebot.steps.byId[item.stepId].blockId,
                stepId: item.stepId,
                buttonId: item.id,
              }}
              pos="absolute"
              right="15px"
            />
          )}
          <Fade
            in={isMouseOver}
            style={{ position: 'absolute', bottom: '-15px', zIndex: 3 }}
            unmountOnExit
          >
            <IconButton
              aria-label="Add item"
              icon={<PlusIcon />}
              size="xs"
              shadow="md"
              colorScheme="blue"
              onClick={handlePlusClick}
            />
          </Fade>
        </Flex>
      )}
    </ContextMenu>
  )
}
