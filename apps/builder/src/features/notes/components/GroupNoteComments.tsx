import { Skeleton, Stack } from '@chakra-ui/react'
import { useNotes } from '../hooks/useNotes'
import { useUser } from '@/features/account/hooks/useUser'
import { NoteComment } from './NoteComment'
import { User } from '../models/User'
import { Note } from '../models/Note'
import { GroupCommentsNoteProps } from './types'
import { CreateNoteForm } from './CreateNoteForm'

export const GroupNoteComments = ({ groupId }: GroupCommentsNoteProps) => {
  const { user } = useUser()
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    isLoadingCreateNote,
    isLoadingFetchNotes,
  } = useNotes(groupId)

  return (
    <Stack spacing={4}>
      <CreateNoteForm
        createNote={createNote}
        groupId={groupId}
        isLoadingCreateNote={isLoadingCreateNote}
      />
      {isLoadingFetchNotes && (
        <Stack>
          <Skeleton w="100%" h="35px" />
          <Skeleton w="100%" h="35px" />
          <Skeleton w="100%" h="35px" />
        </Stack>
      )}

      <Stack>
        {notes.map((note: Note) => (
          <>
            <hr />
            <NoteComment
              note={note}
              user={user as User}
              key={note.id}
              deleteNote={deleteNote}
              updateNote={updateNote}
            />
          </>
        ))}
      </Stack>
    </Stack>
  )
}
