import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Note } from '../models/Note'

export type CommentNoteProps = {
  note: Note
  user: {
    id: string
    name: string
    image?: string
  }
  editComment: string
  commentSelectedId: string | null
  isEditing: boolean
  handleUpdateComment: (input: { id: string; comment: string }) => void
  handleIsEditingNote: (input: { id: string }) => void
  setEditComment: Dispatch<SetStateAction<string>>
  deleteNote: (input: { id: string }) => void
  handleUndoEditing: () => void
}

export type GroupCommentsNoteProps = {
  groupId: string
}

export type GroupNotesPoppoverProps = {
  children: ReactNode
  groupId: string
}
