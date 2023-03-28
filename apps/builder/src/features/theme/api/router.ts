import { router } from '@/helpers/server/trpc'
import { deleteThemeTemplate } from './deleteThemeTemplate'
import { listThemeTemplates } from './listThemeTemplates'
import { saveThemeTemplate } from './saveThemeTemplate'

export const themeRouter = router({
  listThemeTemplates,
  saveThemeTemplate,
  deleteThemeTemplate,
})
