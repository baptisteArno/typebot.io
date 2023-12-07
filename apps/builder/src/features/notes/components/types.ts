import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Note } from '../models/Note'
import { CreateNotesInput } from '../hooks/types'
import { User } from '../models/User'

export type CommentNoteProps = {
  note: Note
  user: User
  deleteNote: (input: { id: string }) => void
  updateNote: ({ id, comment }: { id: string; comment: string }) => void
}

export type GroupCommentsNoteProps = {
  groupId: string
}

export type GroupNotesPoppoverProps = {
  children: ReactNode
  groupId: string
}

export type CreateNoteFormProps = {
  createNote: ({ groupId, comment }: CreateNotesInput) => void
  groupId: string
  isLoadingCreateNote: boolean
}

export type CommentProps = {
  note: Note
  user: User
  editComment: string
  isEditing: boolean
  setEditComment: Dispatch<SetStateAction<string>>
}
