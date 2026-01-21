import { PlateBlock } from '@/features/blocks/bubbles/textBubble/components/plate/PlateBlock'
import { Flex, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { NoteBubbleBlock } from '@typebot.io/schemas/features/blocks/bubbles/note/schema'
import { TElement } from '@udecode/plate-common'

type Props = {
  block: NoteBubbleBlock
}

export const NoteContent = ({ block }: Props) => {
  const { t } = useTranslate()
  const content = block.content
  const isEmpty = (content?.richText?.length ?? 0) === 0 && !content?.plainText

  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={isEmpty ? '0.5' : '1'}
      className="slate-html-container"
      color={isEmpty ? 'gray.500' : 'inherit'}
    >
      {content?.richText && content.richText.length > 0 ? (
        content.richText.map((element: TElement, idx: number) => (
          <PlateBlock key={idx} element={element} />
        ))
      ) : content?.plainText ? (
        <Text noOfLines={3}>{content.plainText}</Text>
      ) : (
        <Text>{t('clickToEdit')}</Text>
      )}
    </Flex>
  )
}
