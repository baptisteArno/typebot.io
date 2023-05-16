const sessionStorageKey = 'resultId'

export const getExistingResultIdFromStorage = (typebotId?: string) => {
  if (!typebotId) return
  try {
    return (
      sessionStorage.getItem(`${sessionStorageKey}-${typebotId}`) ??
      localStorage.getItem(`${sessionStorageKey}-${typebotId}`) ??
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
      ;(storageType === 'session' ? localStorage : sessionStorage).removeItem(
        `${sessionStorageKey}-${typebotId}`
      )
      return (
        storageType === 'session' ? sessionStorage : localStorage
      ).setItem(`${sessionStorageKey}-${typebotId}`, resultId)
    } catch {
      /* empty */
    }
  }
