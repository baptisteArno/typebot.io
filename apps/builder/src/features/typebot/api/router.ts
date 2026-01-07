import { router } from '@/helpers/server/trpc'
import { listTypebots } from './listTypebots'

import { createTypebot } from './createTypebot'
import { updateTypebot } from './updateTypebot'
import { updateTypebotHistory } from './updateTypebotHistory'
import { getTypebotHistory } from './getTypebotHistory'
import { rollbackTypebot } from './rollbackTypebot'

import { getTypebot } from './getTypebot'
import {
  getPublishedTypebot,
  getPublishedTypebotCached,
} from './getPublishedTypebot'
import { publishTypebot } from './publishTypebot'
import { unpublishTypebot } from './unpublishTypebot'
import { deleteTypebot } from './deleteTypebot'
import { importTypebot } from './importTypebot'
import { listTypebotsClaudia } from './listTypebotsClaudia'
import {
  getTypebotValidation,
  postTypebotValidation,
} from './typebotValidation'

export const typebotRouter = router({
  listTypebotsClaudia,
  createTypebot,
  updateTypebot,
  getTypebot,
  getPublishedTypebot,
  getPublishedTypebotCached,
  publishTypebot,
  unpublishTypebot,
  listTypebots,
  deleteTypebot,
  importTypebot,
  getTypebotValidation,
  postTypebotValidation,
  updateTypebotHistory,
  getTypebotHistory,
  rollbackTypebot,
})
