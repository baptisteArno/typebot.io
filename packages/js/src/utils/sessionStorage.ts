const sessionStorageKey = 'resultId'

export const getExistingResultIdFromSession = (typebotId?: string) => {
  if (!typebotId) return
  try {
    return (
      sessionStorage.getItem(`${sessionStorageKey}-${typebotId}`) ?? undefined
    )
  } catch {
    /* empty */
  }
}

export const setResultInSession = (typebotId: string, resultId: string) => {
  try {
    return sessionStorage.setItem(`${sessionStorageKey}-${typebotId}`, resultId)
  } catch {
    /* empty */
  }
}
