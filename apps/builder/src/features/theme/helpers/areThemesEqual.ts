import { ThemeTemplate } from '@typebot.io/schemas'
import { dequal } from 'dequal'

export const areThemesEqual = (
  selectedTemplate: ThemeTemplate['theme'],
  currentTheme: ThemeTemplate['theme']
) =>
  dequal(
    JSON.parse(JSON.stringify(selectedTemplate)),
    JSON.parse(JSON.stringify(currentTheme))
  )
