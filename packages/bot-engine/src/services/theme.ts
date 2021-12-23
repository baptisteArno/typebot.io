import { BackgroundType, Theme } from '../models'

const cssVariableNames = {
  container: {
    bg: {
      image: '--typebot-container-bg-image',
      color: '--typebot-container-bg-color',
    },
    fontFamily: '--typebot-container-font-family',
  },
}

export const setCssVariablesValue = (
  theme: Theme,
  documentStyle: CSSStyleDeclaration
) => {
  const { background, font } = theme.general
  documentStyle.setProperty(
    background.type === BackgroundType.IMAGE
      ? cssVariableNames.container.bg.image
      : cssVariableNames.container.bg.color,
    background.content
  )
  documentStyle.setProperty(cssVariableNames.container.fontFamily, font)
}
