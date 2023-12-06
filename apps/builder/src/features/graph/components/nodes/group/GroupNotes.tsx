import { TextBubbleEditor } from '@/features/blocks/bubbles/textBubble/components/TextBubbleEditor'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { groupWidth } from '@/features/graph/constants'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { TElement } from '@udecode/plate-common'
import { Dispatch, SetStateAction, useRef } from 'react'

type Props = {
  groupId: string
  groupIndex: number
  groupTitle: string
  initialValue?: TElement[]
  currentCoordinates: Record<'x' | 'y', number>
  setIsNoteVisible: Dispatch<SetStateAction<boolean>>
}

export const GroupNotes = ({
  groupId,
  groupIndex,
  groupTitle,
  initialValue,
  currentCoordinates,
  setIsNoteVisible,
}: Props) => {
  const stackRef = useRef(null)
  const { typebot, updateGroup } = useTypebot()
  const bg = useColorModeValue('white', 'gray.900')

  const handleCommentClose = () => {
    setIsNoteVisible(false)
  }

  useOutsideClick({
    ref: stackRef,
    handler: handleCommentClose,
  })

  return (
    <Box
      bg={bg}
      p={4}
      borderRadius="md"
      boxShadow="md"
      maxW={groupWidth}
      minW={groupWidth}
      sx={{
        transform: `translate(${currentCoordinates.x + groupWidth + 12}px, ${
          currentCoordinates.y
        }px)`,
        touchAction: 'none',
      }}
    >
      <Text fontWeight="bold" fontSize="lg" mb={2}>
        Notes for {groupTitle}
      </Text>
      {typebot && (
        <TextBubbleEditor
          id={`text-comment-${groupId}`}
          initialValue={
            initialValue?.length
              ? initialValue
              : [{ type: 'p', children: [{ text: '' }] }]
          }
          onClose={(content) => {
            updateGroup(groupIndex, { notes: content })
          }}
        />
      )}
    </Box>
  )
}
