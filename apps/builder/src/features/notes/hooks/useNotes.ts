import { useUser } from '@/features/account/hooks/useUser'
import { CreateNotesInput } from './types'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { Note } from '../models/Note'
import { useEffect, useState } from 'react'

export const useNotes = (groupId: string) => {
  const { user } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const { showToast } = useToast()

  const {
    data,
    refetch: refetchNotes,
    isLoading: isLoadingFetchNotes,
  } = trpc.notes.getNotes.useQuery({
    groupId,
  })

  const defaultMutationInput = {
    onError: (error: { message: string }) => {
      showToast({
        description: error.message,
      })
    },
    onSuccess: () => {
      refetchNotes()
    },
  }

  const { mutate: createNoteTRPC, isLoading: isLoadingCreateNote } =
    trpc.notes.createNotes.useMutation(defaultMutationInput)

  const { mutate: deleteNoteTRPC, isLoading: isLoadingDeleteNote } =
    trpc.notes.deleteNote.useMutation(defaultMutationInput)

  const { mutate: updateNoteTRPC, isLoading: isLoadingUpdateNote } =
    trpc.notes.updateNote.useMutation(defaultMutationInput)

  useEffect(() => {
    setNotes(data?.notes ?? [])
  }, [data])

  function createNote({ groupId, comment }: CreateNotesInput) {
    if (!user) {
      showToast({
        description: 'User must be logged in to create notes.',
      })
      return
    }
    createNoteTRPC({
      comment,
      groupId,
      userId: user.id,
    })
  }

  function deleteNote({ id }: { id: string }) {
    deleteNoteTRPC({ id })
  }

  function updateNote({ id, comment }: { id: string; comment: string }) {
    updateNoteTRPC({ id, comment })
  }

  return {
    notes,
    createNote,
    deleteNote,
    updateNote,
    isLoadingCreateNote,
    isLoadingDeleteNote,
    isLoadingUpdateNote,
    isLoadingFetchNotes,
  }
}
