import { InitialChatReply } from '@/types'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'

const storageResultIdKey = 'resultId'

export const getExistingResultIdFromStorage = (sniperId?: string) => {
  if (!sniperId) return
  try {
    return (
      sessionStorage.getItem(`${storageResultIdKey}-${sniperId}`) ??
      localStorage.getItem(`${storageResultIdKey}-${sniperId}`) ??
      undefined
    )
  } catch {
    /* empty */
  }
}

export const setResultInStorage =
  (storageType: 'local' | 'session' = 'session') =>
  (sniperId: string, resultId: string) => {
    try {
      parseRememberUserStorage(storageType).setItem(
        `${storageResultIdKey}-${sniperId}`,
        resultId
      )
    } catch {
      /* empty */
    }
  }

export const getInitialChatReplyFromStorage = (
  sniperId: string | undefined
) => {
  if (!sniperId) return
  try {
    const rawInitialChatReply =
      sessionStorage.getItem(`sniper-${sniperId}-initialChatReply`) ??
      localStorage.getItem(`sniper-${sniperId}-initialChatReply`)
    if (!rawInitialChatReply) return
    return JSON.parse(rawInitialChatReply) as InitialChatReply
  } catch {
    /* empty */
  }
}
export const setInitialChatReplyInStorage = (
  initialChatReply: InitialChatReply,
  {
    sniperId,
    storage,
  }: {
    sniperId: string
    storage?: 'local' | 'session'
  }
) => {
  try {
    const rawInitialChatReply = JSON.stringify(initialChatReply)
    parseRememberUserStorage(storage).setItem(
      `sniper-${sniperId}-initialChatReply`,
      rawInitialChatReply
    )
  } catch {
    /* empty */
  }
}

export const setBotOpenedStateInStorage = () => {
  try {
    sessionStorage.setItem(`sniper-botOpened`, 'true')
  } catch {
    /* empty */
  }
}

export const removeBotOpenedStateInStorage = () => {
  try {
    sessionStorage.removeItem(`sniper-botOpened`)
  } catch {
    /* empty */
  }
}

export const getBotOpenedStateFromStorage = () => {
  try {
    return sessionStorage.getItem(`sniper-botOpened`) === 'true'
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

export const wipeExistingChatStateInStorage = (sniperId: string) => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`sniper-${sniperId}`)) localStorage.removeItem(key)
  })
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith(`sniper-${sniperId}`)) sessionStorage.removeItem(key)
  })
}
