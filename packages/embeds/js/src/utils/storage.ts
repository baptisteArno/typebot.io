import { StartChatResponse } from '@typebot.io/schemas/features/chat/schema'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'

const storageResultIdKey = 'resultId'

export const getExistingResultIdFromStorage = (typebotId?: string) => {
  if (!typebotId) return
  try {
    return (
      sessionStorage.getItem(`${storageResultIdKey}-${typebotId}`) ??
      localStorage.getItem(`${storageResultIdKey}-${typebotId}`) ??
      undefined
    )
  } catch {
    /* empty */
  }
}

export const setResultInStorage =
  (storageType: 'local' | 'session' = 'session') =>
  (typebotId: string, resultId: string) => {
    try {
      parseRememberUserStorage(storageType).setItem(
        `${storageResultIdKey}-${typebotId}`,
        resultId
      )
    } catch {
      /* empty */
    }
  }

export const getInitialChatReplyFromStorage = (
  typebotId: string | undefined
) => {
  if (!typebotId) return
  try {
    const rawInitialChatReply =
      sessionStorage.getItem(`typebot-${typebotId}-initialChatReply`) ??
      localStorage.getItem(`typebot-${typebotId}-initialChatReply`)
    if (!rawInitialChatReply) return
    return JSON.parse(rawInitialChatReply) as StartChatResponse
  } catch {
    /* empty */
  }
}
export const setInitialChatReplyInStorage = (
  initialChatReply: StartChatResponse,
  {
    typebotId,
    storage,
  }: {
    typebotId: string
    storage?: 'local' | 'session'
  }
) => {
  try {
    const rawInitialChatReply = JSON.stringify(initialChatReply)
    parseRememberUserStorage(storage).setItem(
      `typebot-${typebotId}-initialChatReply`,
      rawInitialChatReply
    )
  } catch {
    /* empty */
  }
}

export const setBotOpenedStateInStorage = () => {
  try {
    sessionStorage.setItem(`typebot-botOpened`, 'true')
  } catch {
    /* empty */
  }
}

export const removeBotOpenedStateInStorage = () => {
  try {
    sessionStorage.removeItem(`typebot-botOpened`)
  } catch {
    /* empty */
  }
}

export const getBotOpenedStateFromStorage = () => {
  try {
    return sessionStorage.getItem(`typebot-botOpened`) === 'true'
  } catch {
    return false
  }
}

export const parseRememberUserStorage = (
  storage: 'local' | 'session' | undefined
): typeof localStorage | typeof sessionStorage =>
  (storage ?? defaultSettings.general.rememberUser.storage) === 'session'
    ? sessionStorage
    : localStorage

export const wipeExistingChatStateInStorage = (typebotId: string) => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`typebot-${typebotId}`)) localStorage.removeItem(key)
  })
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith(`typebot-${typebotId}`)) sessionStorage.removeItem(key)
  })
}
