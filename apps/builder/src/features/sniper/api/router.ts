import { router } from '@/helpers/server/trpc'
import { listSnipers } from './listSnipers'
import { createSniper } from './createSniper'
import { updateSniper } from './updateSniper'
import { getSniper } from './getSniper'
import { getPublishedSniper } from './getPublishedSniper'
import { publishSniper } from './publishSniper'
import { unpublishSniper } from './unpublishSniper'
import { deleteSniper } from './deleteSniper'
import { importSniper } from './importSniper'

export const sniperRouter = router({
  createSniper,
  updateSniper,
  getSniper,
  getPublishedSniper,
  publishSniper,
  unpublishSniper,
  listSnipers,
  deleteSniper,
  importSniper,
})
