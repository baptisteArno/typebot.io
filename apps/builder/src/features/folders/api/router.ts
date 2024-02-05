import { router } from '@/helpers/server/trpc'
import { createFolder } from './createFolder'
import { updateFolder } from './updateFolder'
import { deleteFolder } from './deleteFolder'
import { listFolders } from './listFolders'
import { getFolder } from './getFolder'

export const folderRouter = router({
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  listFolders,
})
