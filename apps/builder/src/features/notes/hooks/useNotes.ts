import { useEffect, useState } from 'react'
import { useUser } from '@/features/account/hooks/useUser'
import { CreateNotesInput } from './types'
import { Note } from '../models/Note.js'

export const useNotes = () => {
  const { user } = useUser()
  const [id, setId] = useState(1)
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    const dataFetchedNote = [
      {
        id: 'id',
        groupId: 'id',
        userId: 'id',
        avatarUrl:
          'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name: 'Manson McLary',
        comment: 'Good idea Henrique!',
      } as Note,
    ]

    setNotes(dataFetchedNote)
  }, [])

  function createNote({ groupId, comment }: CreateNotesInput) {
    const newNote = {
      id: String(id),
      groupId,
      userId: user!.id!,
      avatarUrl: user!.image,
      name: user!.name,
      comment,
    }

    setId(id + 1)
    setNotes([...notes, newNote as Note])
  }

  function deleteNote({ id }: { id: string }) {
    const filterNotes = notes.filter((nt) => nt.id !== id)
    setNotes(filterNotes)
  }

  function updateNote({ id, comment }: { id: string; comment: string }) {
    const noteFound = notes.find((nt) => nt.id === id)
    noteFound && (noteFound.comment = comment)
  }

  return {
    notes,
    createNote,
    deleteNote,
    updateNote,
  }
}
