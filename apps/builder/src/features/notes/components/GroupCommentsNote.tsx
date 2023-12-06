import { Stack } from '@chakra-ui/react'
import { useNotes } from '../hooks/useNotes'
import { useUser } from '@/features/account/hooks/useUser'
import { CommentNote } from './CommentNote'
import { User } from '../models/User'
import { Note } from '../models/Note'
import { GroupCommentsNoteProps } from './types'
import { CreateNoteForm } from './CreateNoteForm'

export const GroupCommentsNote = ({ groupId }: GroupCommentsNoteProps) => {
  const { user } = useUser()
  const { notes, createNote, updateNote, deleteNote } = useNotes()

  return (
    <Stack spacing={4}>
      <CreateNoteForm createNote={createNote} groupId={groupId} />
      {notes.map((note: Note) => (
        <>
          <CommentNote
            note={note}
            user={user as User}
            key={note.id}
            deleteNote={deleteNote}
            updateNote={updateNote}
          />
          <hr />
        </>
      ))}
    </Stack>
  )
}
