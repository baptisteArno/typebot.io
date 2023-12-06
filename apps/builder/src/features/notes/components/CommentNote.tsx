import { CheckIcon, EditIcon, UndoIcon, TrashIcon } from '@/components/icons'
import {
  Flex,
  IconButton,
  Stack,
  Avatar,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { CommentNoteProps } from './types'

export const CommentNote = ({
  note,
  user,
  commentSelectedId,
  handleUpdateComment,
  isEditing,
  handleIsEditingNote,
  editComment,
  setEditComment,
  deleteNote,
  handleUndoEditing,
}: CommentNoteProps) => {
  return (
    <Stack direction="row" align="center" width="100%" position="relative">
      {note.userId === user.id && (
        <Flex position="absolute" top="-3" right="0" zIndex={1}>
          {commentSelectedId === note.id && isEditing ? (
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
                onClick={() => handleIsEditingNote({ id: note.id })}
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
      <Avatar src={note.avatarUrl} />
      <Flex width="100%" direction="column">
        <Text fontSize="md">{note.name}</Text>
        {commentSelectedId === note.id &&
        note.userId === user?.id &&
        isEditing ? (
          <Textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
        ) : (
          <Text fontSize="sm" width="82%">{`${note.comment}`}</Text>
        )}
      </Flex>
    </Stack>
  )
}
