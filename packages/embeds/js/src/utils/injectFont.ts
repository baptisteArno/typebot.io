import { isEmpty } from '@typebot.io/lib'
import { Font } from '@typebot.io/schemas'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'

const googleFontCdnBaseUrl = 'https://fonts.bunny.net/css2'

export const injectFont = (font: Font) => {
  const existingFont = document.getElementById('bot-font')

  if (typeof font === 'string' || font.type === 'Google') {
    const fontFamily =
      (typeof font === 'string' ? font : font.family) ??
      defaultTheme.general.font.family
    if (existingFont?.getAttribute('href')?.includes(fontFamily)) return
    const fontElement = document.createElement('link')
    fontElement.href = `${googleFontCdnBaseUrl}?family=${fontFamily}:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap`
    fontElement.rel = 'stylesheet'
    fontElement.id = 'bot-font'
    document.head.appendChild(fontElement)
    return
  }

  if (font.type === 'Custom') {
    if (existingFont?.getAttribute('href') === font.url || isEmpty(font.url))
      return
    const fontElement = document.createElement('link')
    fontElement.href = font.url
    fontElement.rel = 'stylesheet'
    fontElement.id = 'bot-font'
    document.head.appendChild(fontElement)
  }
}
