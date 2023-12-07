import { Stack } from '@chakra-ui/react'
import { useNotes } from '../hooks/useNotes'
import { useUser } from '@/features/account/hooks/useUser'
import { NoteComment } from './NoteComment'
import { User } from '../models/User'
import { Note } from '../models/Note'
import { GroupCommentsNoteProps } from './types'
import { CreateNoteForm } from './CreateNoteForm'

export const GroupNoteComments = ({ groupId }: GroupCommentsNoteProps) => {
  const { user } = useUser()
  const { notes, createNote, updateNote, deleteNote } = useNotes(groupId)

  return (
    <Stack spacing={4}>
      <CreateNoteForm createNote={createNote} groupId={groupId} />
      {notes.map((note: Note) => (
        <>
          <NoteComment
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
