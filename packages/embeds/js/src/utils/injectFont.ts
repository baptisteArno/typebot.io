import { isNotEmpty } from '@typebot.io/lib'
import { Font } from '@typebot.io/schemas'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'

const googleFontCdnBaseUrl = 'https://fonts.bunny.net/css2'
const elementId = 'typebot-font'

export const injectFont = (font: Font) => {
  const existingFont = document.getElementById(elementId)

  if (typeof font === 'string' || font.type === 'Google') {
    const fontFamily =
      (typeof font === 'string' ? font : font.family) ??
      defaultTheme.general.font.family
    if (existingFont?.getAttribute('href')?.includes(fontFamily)) return
    existingFont?.remove()
    const fontElement = document.createElement('link')
    fontElement.href = `${googleFontCdnBaseUrl}?family=${fontFamily}:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap`
    fontElement.rel = 'stylesheet'
    fontElement.id = elementId
    document.head.appendChild(fontElement)
    return
  }

  if (font.type === 'Custom') {
    if (isNotEmpty(font.css)) {
      if (existingFont?.innerHTML === font.css) return
      existingFont?.remove()
      const style = document.createElement('style')
      style.innerHTML = font.css
      style.id = elementId
      document.head.appendChild(style)
    }
    if (isNotEmpty(font.url)) {
      if (existingFont?.getAttribute('href') === font.url) return
      existingFont?.remove()
      const fontElement = document.createElement('link')
      fontElement.href = font.url
      fontElement.rel = 'stylesheet'
      fontElement.id = elementId
      document.head.appendChild(fontElement)
    }
  }
}
