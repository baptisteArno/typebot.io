import { CheckIcon, EditIcon, UndoIcon, TrashIcon } from '@/components/icons'
import { Flex, IconButton, Stack } from '@chakra-ui/react'
import { CommentNoteProps } from './types'
import { useState } from 'react'
import { Comment } from './Comment'

export const NoteComment = ({
  note,
  user,
  updateNote,
  deleteNote,
}: CommentNoteProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editComment, setEditComment] = useState('')

  function handleIsEditingNote() {
    setIsEditing(true)
  }

  function handleUndoEditing() {
    setIsEditing(false)
  }

  const handleUpdateComment = ({
    comment,
    id,
  }: {
    id: string
    comment: string
  }) => {
    updateNote({ id, comment })
    setEditComment('')
    setIsEditing(false)
  }

  return (
    <Stack direction="row" align="center" width="100%" position="relative">
      {note.userId === user.id && (
        <Flex position="absolute" top="-3" right="0" zIndex={1}>
          {isEditing ? (
            <>
              <IconButton
                icon={<CheckIcon />}
                aria-label="Confirm edit note"
                variant="ghost"
                onClick={() =>
                  handleUpdateComment({
                    id: note.id,
                    comment: editComment,
                  })
                }
              />
              <IconButton
                icon={<UndoIcon />}
                aria-label="Undo editing"
                variant="ghost"
                onClick={() => handleUndoEditing()}
              />
            </>
          ) : (
            <>
              <IconButton
                icon={<EditIcon />}
                aria-label="Edit note"
                variant="ghost"
                onClick={() => handleIsEditingNote()}
              />
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove comment"
                variant="ghost"
                onClick={() => deleteNote({ id: note.id })}
              />
            </>
          )}
        </Flex>
      )}
      <Comment
        editComment={editComment}
        isEditing={isEditing}
        note={note}
        setEditComment={setEditComment}
        user={user}
      />
    </Stack>
  )
}
