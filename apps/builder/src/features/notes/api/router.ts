import { router } from '@/helpers/server/trpc'
import { createNotes } from './createNotes'
import { getNotes } from './getNotes'
import { deleteNote } from './deleteNote'
import { updateNote } from './updateNote'

export const notesRouter = router({
  createNotes,
  getNotes,
  deleteNote,
  updateNote,
})
