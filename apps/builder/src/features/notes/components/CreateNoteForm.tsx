import { Button, Stack, Textarea } from '@chakra-ui/react'
import { CreateNoteFormProps } from './types'
import { useState } from 'react'

export const CreateNoteForm = ({
  createNote,
  groupId,
  isLoadingCreateNote,
}: CreateNoteFormProps) => {
  const [comment, setComment] = useState<string>('')

  function handleCreateNote() {
    if (!comment) return
    createNote({ groupId, comment })
    setComment('')
  }

  return (
    <Stack spacing={4} display="flex" alignItems="flex-end">
      <Textarea
        placeholder="Add a new note..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        onClick={handleCreateNote}
        colorScheme="blue"
        bgColor="blue"
        width="28"
        height="10"
        isLoading={isLoadingCreateNote}
      >
        Comment
      </Button>
    </Stack>
  )
}
