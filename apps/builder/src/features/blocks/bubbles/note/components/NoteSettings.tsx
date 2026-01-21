import { Textarea } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { NoteBubbleBlock } from '@typebot.io/schemas/features/blocks/bubbles/note/schema'

type Props = {
  block: NoteBubbleBlock
  onContentChange: (content: { plainText: string }) => void
}

export const NoteSettings = ({ block, onContentChange }: Props) => {
  const { t } = useTranslate()

  return (
    <Textarea
      placeholder={t('clickToEdit')}
      value={block.content?.plainText ?? ''}
      onChange={(e) => onContentChange({ plainText: e.target.value })}
      minH="150px"
    />
  )
}
