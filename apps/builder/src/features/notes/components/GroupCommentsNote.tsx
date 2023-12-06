import { Button, Stack, Textarea } from '@chakra-ui/react'
import { useState } from 'react'
import { useNotes } from '../hooks/useNotes'
import { useUser } from '@/features/account/hooks/useUser'
import { CommentNote } from './CommentNote'
import { User } from '../models/User'
import { Note } from '../models/Note'
import { GroupCommentsNoteProps } from './types'

export const GroupCommentsNote = ({ groupId }: GroupCommentsNoteProps) => {
  const [comment, setComment] = useState<string>('')
  const [commentSelectedId, setCommentSelectedId] = useState<string | null>(
    null
  )
  const { user } = useUser()
  const { notes, createNote, updateNote, deleteNote } = useNotes()
  const [isEditing, setIsEditing] = useState(false)
  const [editComment, setEditComment] = useState('')

  function handleCreateNote() {
    if (!comment) return
    createNote({ groupId, comment })
    setComment('')
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

  function handleIsEditingNote({ id }: { id: string }) {
    setIsEditing(true)
    setCommentSelectedId(id)
  }

  function handleUndoEditing() {
    setIsEditing(false)
    setCommentSelectedId(null)
  }

  return (
    <Stack spacing={4}>
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
        >
          Comment
        </Button>
      </Stack>

      {notes.map((note: Note) => (
        <>
          <CommentNote
            note={note}
            commentSelectedId={commentSelectedId}
            user={user as User}
            handleUpdateComment={handleUpdateComment}
            isEditing={isEditing}
            handleIsEditingNote={handleIsEditingNote}
            editComment={editComment}
            setEditComment={setEditComment}
            key={note.id}
            deleteNote={deleteNote}
            handleUndoEditing={handleUndoEditing}
          />
          <hr />
        </>
      ))}
    </Stack>
  )
}
