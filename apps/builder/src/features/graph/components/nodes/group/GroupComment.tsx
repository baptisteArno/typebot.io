import { TextBubbleEditor } from '@/features/blocks/bubbles/textBubble/components/TextBubbleEditor'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { groupWidth } from '@/features/graph/constants'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { chakra, Stack, useColorModeValue } from '@chakra-ui/react'
import { TElement } from '@udecode/plate-common'
import { Dispatch, SetStateAction, useRef } from 'react'

type Props = {
  groupId: string
  groupIndex: number
  initialValue?: TElement[]
  currentCoordinates: Record<'x' | 'y', number>
  setIsCommentActive: Dispatch<SetStateAction<boolean>>
}

export const GroupComment = ({
  groupId,
  groupIndex,
  initialValue,
  currentCoordinates,
  setIsCommentActive,
}: Props) => {
  const stackRef = useRef(null)
  const { typebot, updateGroup } = useTypebot()
  const bg = useColorModeValue('white', 'gray.900')

  const handleCommentClose = () => {
    setIsCommentActive(false)
  }

  useOutsideClick({
    ref: stackRef,
    handler: handleCommentClose,
  })
	
  return (
    <Stack
      id={`comment-${groupId}`}
      ref={stackRef}
      p="4"
      pb="5"
      rounded="xl"
      bg={bg}
      borderWidth="1px"
      w={groupWidth}
      transition="border 300ms, box-shadow 200ms"
      pos="absolute"
      style={{
        transform: `translate(${
          currentCoordinates?.x + groupWidth + 12 ?? 0
        }px, ${currentCoordinates?.y ?? 0}px)`,
        touchAction: 'none',
      }}
      cursor={'auto'}
      shadow="md"
    >
      <chakra.h3 fontWeight="semibold" pl="1" py="2">
        Observation Note
      </chakra.h3>
      {typebot && (
        <TextBubbleEditor
          id={`text-comment-${groupId}`}
          initialValue={
						initialValue?.length
							? initialValue
							: [{ type: "p", children: [{ text: "" }] }]
					}
          onClose={(newContent) => {
            updateGroup(groupIndex, { comment: newContent })
          }}
        />
      )}
    </Stack>
  )
}
