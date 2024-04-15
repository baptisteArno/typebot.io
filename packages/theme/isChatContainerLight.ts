import { isLight } from '@typebot.io/lib/hexToRgb'
import { ContainerTheme, GeneralTheme } from '@typebot.io/schemas'
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultBackgroundType,
  defaultContainerBackgroundColor,
  defaultOpacity,
} from '@typebot.io/schemas/features/typebot/theme/constants'
import { isEmpty, isNotEmpty } from '@typebot.io/lib'

type Props = {
  chatContainer: ContainerTheme | undefined
  generalBackground: GeneralTheme['background']
}

export const isChatContainerLight = ({
  chatContainer,
  generalBackground,
}: Props): boolean => {
  const chatContainerBgColor =
    chatContainer?.backgroundColor ?? defaultContainerBackgroundColor
  const ignoreChatBackground =
    (chatContainer?.opacity ?? defaultOpacity) <= 0.3 ||
    chatContainerBgColor === 'transparent' ||
    isEmpty(chatContainerBgColor)

  if (ignoreChatBackground) {
    const bgType = generalBackground?.type ?? defaultBackgroundType
    const backgroundColor =
      bgType === BackgroundType.IMAGE
        ? '#000000'
        : bgType === BackgroundType.COLOR &&
          isNotEmpty(generalBackground?.content)
        ? generalBackground.content
        : '#ffffff'
    return isLight(backgroundColor)
  }

  return isLight(chatContainer?.backgroundColor ?? defaultBackgroundColor)
}
