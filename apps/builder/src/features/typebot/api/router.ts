import { router } from '@/helpers/server/trpc'
import { listTypebots } from './listTypebots'

import { createTypebot } from './createTypebot'
import { updateTypebot } from './updateTypebot'
import { getTypebot } from './getTypebot'
import { getPublishedTypebot } from './getPublishedTypebot'
import { publishTypebot } from './publishTypebot'
import { unpublishTypebot } from './unpublishTypebot'
import { deleteTypebot } from './deleteTypebot'
import { importTypebot } from './importTypebot'
import { listTypebotsClaudia } from './listTypebotsClaudia'

export const typebotRouter = router({
  listTypebotsClaudia,
  createTypebot,
  updateTypebot,
  getTypebot,
  getPublishedTypebot,
  publishTypebot,
  unpublishTypebot,
  listTypebots,
  deleteTypebot,
  importTypebot,
})
